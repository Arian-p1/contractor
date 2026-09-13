/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/contractor.json`.
 */
export type Contractor = {
  "address": "DPcFT7E8GWzzgUfzP3M1VgBnipr8eR5Y4yv5f28wRt7k",
  "metadata": {
    "name": "contractor",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Non-custodial anonymous SOL escrow on Solana"
  },
  "instructions": [
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "feeBps",
          "type": "u16"
        },
        {
          "name": "feeRecipient",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "createDeal",
      "discriminator": [
        198,
        212,
        144,
        151,
        97,
        56,
        149,
        113
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "deal",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "dealId",
          "type": "u64"
        },
        {
          "name": "payee",
          "type": "pubkey"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "termsHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "deposit",
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "deal",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "confirmComplete",
      "discriminator": [
        47,
        56,
        204,
        21,
        194,
        12,
        137,
        142
      ],
      "accounts": [
        {
          "name": "signer",
          "signer": true
        },
        {
          "name": "config"
        },
        {
          "name": "deal",
          "writable": true
        },
        {
          "name": "payee",
          "writable": true
        },
        {
          "name": "feeRecipient",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "confirmCancel",
      "discriminator": [
        129,
        56,
        14,
        100,
        112,
        223,
        107,
        162
      ],
      "accounts": [
        {
          "name": "signer",
          "signer": true
        },
        {
          "name": "deal",
          "writable": true
        },
        {
          "name": "payer",
          "writable": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "config",
      "discriminator": [
        155,
        12,
        170,
        224,
        30,
        600,
        204,
        130
      ]
    },
    {
      "name": "deal",
      "discriminator": [
        125,
        223,
        160,
        234,
        71,
        162,
        182,
        219
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidFeeBps",
      "msg": "fee_bps must be between 1 and 1000"
    },
    {
      "code": 6001,
      "name": "invalidAmount",
      "msg": "amount must be greater than zero"
    },
    {
      "code": 6002,
      "name": "payeeEqualsPayer",
      "msg": "payee cannot equal payer"
    },
    {
      "code": 6003,
      "name": "invalidStatus",
      "msg": "invalid deal status for this instruction"
    },
    {
      "code": 6004,
      "name": "unauthorized",
      "msg": "unauthorized signer"
    },
    {
      "code": 6005,
      "name": "mathOverflow",
      "msg": "math overflow"
    },
    {
      "code": 6006,
      "name": "invalidPayee",
      "msg": "payee account mismatch"
    },
    {
      "code": 6007,
      "name": "invalidFeeRecipient",
      "msg": "fee recipient mismatch"
    }
  ],
  "types": [
    {
      "name": "config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "feeBps",
            "type": "u16"
          },
          {
            "name": "feeRecipient",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "deal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "payer",
            "type": "pubkey"
          },
          {
            "name": "payee",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "dealId",
            "type": "u64"
          },
          {
            "name": "termsHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "dealStatus"
              }
            }
          },
          {
            "name": "payerComplete",
            "type": "bool"
          },
          {
            "name": "payeeComplete",
            "type": "bool"
          },
          {
            "name": "payerCancel",
            "type": "bool"
          },
          {
            "name": "payeeCancel",
            "type": "bool"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "dealStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "created"
          },
          {
            "name": "funded"
          },
          {
            "name": "released"
          },
          {
            "name": "refunded"
          }
        ]
      }
    }
  ]
};
