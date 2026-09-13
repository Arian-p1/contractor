use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};

declare_id!("DPcFT7E8GWzzgUfzP3M1VgBnipr8eR5Y4yv5f28wRt7k");

pub const CONFIG_SEED: &[u8] = b"config";
pub const DEAL_SEED: &[u8] = b"deal";
pub const MIN_FEE_BPS: u16 = 1;
pub const MAX_FEE_BPS: u16 = 1000;
pub const DEFAULT_FEE_BPS: u16 = 600;
pub const BPS_DENOMINATOR: u128 = 10_000;

#[program]
pub mod contractor {
    use super::*;

    /// Initialize global config once. Fee is immutable after this.
    pub fn initialize(ctx: Context<Initialize>, fee_bps: u16, fee_recipient: Pubkey) -> Result<()> {
        require!(
            fee_bps >= MIN_FEE_BPS && fee_bps <= MAX_FEE_BPS,
            ContractorError::InvalidFeeBps
        );

        let config = &mut ctx.accounts.config;
        config.fee_bps = fee_bps;
        config.fee_recipient = fee_recipient;
        config.bump = ctx.bumps.config;

        msg!(
            "Config initialized: fee_bps={}, fee_recipient={}",
            fee_bps,
            fee_recipient
        );
        Ok(())
    }

    /// Create a deal. Signer is both creator and payer (v1).
    pub fn create_deal(
        ctx: Context<CreateDeal>,
        deal_id: u64,
        payee: Pubkey,
        amount: u64,
        terms_hash: [u8; 32],
    ) -> Result<()> {
        require!(amount > 0, ContractorError::InvalidAmount);
        require!(
            payee != ctx.accounts.creator.key(),
            ContractorError::PayeeEqualsPayer
        );

        let deal = &mut ctx.accounts.deal;
        deal.creator = ctx.accounts.creator.key();
        deal.payer = ctx.accounts.creator.key();
        deal.payee = payee;
        deal.amount = amount;
        deal.deal_id = deal_id;
        deal.terms_hash = terms_hash;
        deal.status = DealStatus::Created;
        deal.payer_complete = false;
        deal.payee_complete = false;
        deal.payer_cancel = false;
        deal.payee_cancel = false;
        deal.created_at = Clock::get()?.unix_timestamp;
        deal.bump = ctx.bumps.deal;

        msg!("Deal {} created for {} lamports", deal_id, amount);
        Ok(())
    }

    /// Deposit exact deal amount into the deal PDA. Created → Funded.
    pub fn deposit(ctx: Context<Deposit>) -> Result<()> {
        let deal = &mut ctx.accounts.deal;
        require!(
            deal.status == DealStatus::Created,
            ContractorError::InvalidStatus
        );
        require_keys_eq!(
            deal.payer,
            ctx.accounts.payer.key(),
            ContractorError::Unauthorized
        );

        let amount = deal.amount;
        transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.payer.to_account_info(),
                    to: deal.to_account_info(),
                },
            ),
            amount,
        )?;

        deal.status = DealStatus::Funded;
        msg!("Deal {} funded with {} lamports", deal.deal_id, amount);
        Ok(())
    }

    /// Either party confirms work complete. Both → release with fee.
    pub fn confirm_complete(ctx: Context<ConfirmComplete>) -> Result<()> {
        let deal = &mut ctx.accounts.deal;
        require!(
            deal.status == DealStatus::Funded,
            ContractorError::InvalidStatus
        );

        let signer = ctx.accounts.signer.key();
        if signer == deal.payer {
            deal.payer_complete = true;
        } else if signer == deal.payee {
            deal.payee_complete = true;
        } else {
            return err!(ContractorError::Unauthorized);
        }

        if !(deal.payer_complete && deal.payee_complete) {
            msg!(
                "Deal {} complete flags: payer={}, payee={}",
                deal.deal_id,
                deal.payer_complete,
                deal.payee_complete
            );
            return Ok(());
        }

        // Both confirmed — release with fee
        let config = &ctx.accounts.config;
        let amount = deal.amount as u128;
        let fee = amount
            .checked_mul(config.fee_bps as u128)
            .ok_or(ContractorError::MathOverflow)?
            .checked_div(BPS_DENOMINATOR)
            .ok_or(ContractorError::MathOverflow)? as u64;
        let payout = deal
            .amount
            .checked_sub(fee)
            .ok_or(ContractorError::MathOverflow)?;

        let bump = deal.bump;
        let creator = deal.creator;
        let deal_id = deal.deal_id;
        let seeds: &[&[u8]] = &[
            DEAL_SEED,
            creator.as_ref(),
            &deal_id.to_le_bytes(),
            &[bump],
        ];

        // Transfer payout to payee
        **deal.to_account_info().try_borrow_mut_lamports()? -= payout;
        **ctx
            .accounts
            .payee
            .to_account_info()
            .try_borrow_mut_lamports()? += payout;

        // Transfer fee to fee_recipient
        if fee > 0 {
            **deal.to_account_info().try_borrow_mut_lamports()? -= fee;
            **ctx
                .accounts
                .fee_recipient
                .to_account_info()
                .try_borrow_mut_lamports()? += fee;
        }

        // Keep seeds referenced for PDA signing semantics / future CPI
        let _ = seeds;

        deal.status = DealStatus::Released;
        msg!(
            "Deal {} released: payout={}, fee={}",
            deal.deal_id,
            payout,
            fee
        );
        Ok(())
    }

    /// Either party confirms cancel. Both Funded → full refund; both Created → close.
    pub fn confirm_cancel(ctx: Context<ConfirmCancel>) -> Result<()> {
        let deal = &mut ctx.accounts.deal;
        require!(
            deal.status == DealStatus::Created || deal.status == DealStatus::Funded,
            ContractorError::InvalidStatus
        );

        let signer = ctx.accounts.signer.key();
        if signer == deal.payer {
            deal.payer_cancel = true;
        } else if signer == deal.payee {
            deal.payee_cancel = true;
        } else {
            return err!(ContractorError::Unauthorized);
        }

        if !(deal.payer_cancel && deal.payee_cancel) {
            msg!(
                "Deal {} cancel flags: payer={}, payee={}",
                deal.deal_id,
                deal.payer_cancel,
                deal.payee_cancel
            );
            return Ok(());
        }

        if deal.status == DealStatus::Funded {
            let amount = deal.amount;
            **deal.to_account_info().try_borrow_mut_lamports()? -= amount;
            **ctx
                .accounts
                .payer
                .to_account_info()
                .try_borrow_mut_lamports()? += amount;
            deal.status = DealStatus::Refunded;
            msg!("Deal {} refunded {} lamports (no fee)", deal.deal_id, amount);
        } else {
            // Created with no funds — mark refunded (effectively closed state)
            deal.status = DealStatus::Refunded;
            msg!("Deal {} cancelled before funding", deal.deal_id);
        }

        Ok(())
    }
}

// ─── Accounts ───────────────────────────────────────────────────────────────

#[account]
pub struct Config {
    pub fee_bps: u16,
    pub fee_recipient: Pubkey,
    pub bump: u8,
}

impl Config {
    pub const LEN: usize = 8 + 2 + 32 + 1;
}

#[account]
pub struct Deal {
    pub creator: Pubkey,
    pub payer: Pubkey,
    pub payee: Pubkey,
    pub amount: u64,
    pub deal_id: u64,
    pub terms_hash: [u8; 32],
    pub status: DealStatus,
    pub payer_complete: bool,
    pub payee_complete: bool,
    pub payer_cancel: bool,
    pub payee_cancel: bool,
    pub created_at: i64,
    pub bump: u8,
}

impl Deal {
    // 8 disc + 32*3 + 8*2 + 32 + 1 status + 4 bools + 8 created_at + 1 bump
    pub const LEN: usize = 8 + 32 + 32 + 32 + 8 + 8 + 32 + 1 + 1 + 1 + 1 + 1 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum DealStatus {
    Created,
    Funded,
    Released,
    Refunded,
}

// ─── Contexts ───────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = Config::LEN,
        seeds = [CONFIG_SEED],
        bump
    )]
    pub config: Account<'info, Config>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(deal_id: u64)]
pub struct CreateDeal<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        space = Deal::LEN,
        seeds = [DEAL_SEED, creator.key().as_ref(), &deal_id.to_le_bytes()],
        bump
    )]
    pub deal: Account<'info, Deal>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        mut,
        seeds = [DEAL_SEED, deal.creator.as_ref(), &deal.deal_id.to_le_bytes()],
        bump = deal.bump,
        has_one = payer @ ContractorError::Unauthorized,
    )]
    pub deal: Account<'info, Deal>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ConfirmComplete<'info> {
    pub signer: Signer<'info>,

    #[account(
        seeds = [CONFIG_SEED],
        bump = config.bump,
    )]
    pub config: Account<'info, Config>,

    #[account(
        mut,
        seeds = [DEAL_SEED, deal.creator.as_ref(), &deal.deal_id.to_le_bytes()],
        bump = deal.bump,
    )]
    pub deal: Account<'info, Deal>,

    /// CHECK: validated against deal.payee in handler / constraint
    #[account(mut, address = deal.payee @ ContractorError::InvalidPayee)]
    pub payee: UncheckedAccount<'info>,

    /// CHECK: validated against config.fee_recipient
    #[account(mut, address = config.fee_recipient @ ContractorError::InvalidFeeRecipient)]
    pub fee_recipient: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct ConfirmCancel<'info> {
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [DEAL_SEED, deal.creator.as_ref(), &deal.deal_id.to_le_bytes()],
        bump = deal.bump,
    )]
    pub deal: Account<'info, Deal>,

    /// CHECK: validated against deal.payer
    #[account(mut, address = deal.payer @ ContractorError::Unauthorized)]
    pub payer: UncheckedAccount<'info>,
}

// ─── Errors ─────────────────────────────────────────────────────────────────

#[error_code]
pub enum ContractorError {
    #[msg("fee_bps must be between 1 and 1000")]
    InvalidFeeBps,
    #[msg("amount must be greater than zero")]
    InvalidAmount,
    #[msg("payee cannot equal payer")]
    PayeeEqualsPayer,
    #[msg("invalid deal status for this instruction")]
    InvalidStatus,
    #[msg("unauthorized signer")]
    Unauthorized,
    #[msg("math overflow")]
    MathOverflow,
    #[msg("payee account mismatch")]
    InvalidPayee,
    #[msg("fee recipient mismatch")]
    InvalidFeeRecipient,
}
