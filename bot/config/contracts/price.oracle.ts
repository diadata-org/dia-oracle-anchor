export const ASSET_PRICE_ANCHOR_ABI = {
  source: {
    hash: '0x6a14b5923f5120d28df54b403b78a92cc9c892c1125974090d906ca2034c8e03',
    language: 'ink! 4.2.1',
    compiler: 'rustc 1.69.0',
    build_info: {
      build_mode: 'Release',
      cargo_contract_version: '3.0.1',
      rust_toolchain: 'stable-x86_64-unknown-linux-gnu',
      wasm_opt_settings: {
        keep_debug_symbols: false,
        optimization_passes: 'Z'
      }
    }
  },
  contract: {
    name: 'blockchain',
    version: '0.1.0',
    authors: ['slymewl slymewl@pellartech.com']
  },
  spec: {
    constructors: [
      {
        args: [],
        default: false,
        docs: [],
        label: 'new',
        payable: false,
        returnType: {
          displayName: ['ink_primitives', 'ConstructorResult'],
          type: 7
        },
        selector: '0x9bae9d5e'
      }
    ],
    docs: [],
    environment: {
      accountId: {
        displayName: ['AccountId'],
        type: 0
      },
      balance: {
        displayName: ['Balance'],
        type: 6
      },
      blockNumber: {
        displayName: ['BlockNumber'],
        type: 15
      },
      chainExtension: {
        displayName: ['ChainExtension'],
        type: 20
      },
      hash: {
        displayName: ['Hash'],
        type: 19
      },
      maxEventTopics: 4,
      timestamp: {
        displayName: ['Timestamp'],
        type: 5
      }
    },
    events: [
      {
        args: [
          {
            docs: [],
            indexed: true,
            label: 'previous_owner',
            type: {
              displayName: ['Option'],
              type: 18
            }
          },
          {
            docs: [],
            indexed: true,
            label: 'new_owner',
            type: {
              displayName: ['AccountId'],
              type: 0
            }
          }
        ],
        docs: [],
        label: 'OwnershipTransferred'
      },
      {
        args: [
          {
            docs: [],
            indexed: true,
            label: 'old',
            type: {
              displayName: ['Option'],
              type: 18
            }
          },
          {
            docs: [],
            indexed: true,
            label: 'new',
            type: {
              displayName: ['AccountId'],
              type: 0
            }
          }
        ],
        docs: [],
        label: 'UpdaterChanged'
      },
      {
        args: [
          {
            docs: [],
            indexed: true,
            label: 'pair',
            type: {
              displayName: ['String'],
              type: 11
            }
          },
          {
            docs: [],
            indexed: true,
            label: 'price',
            type: {
              displayName: ['u128'],
              type: 6
            }
          },
          {
            docs: [],
            indexed: false,
            label: 'timestamp',
            type: {
              displayName: ['u64'],
              type: 5
            }
          }
        ],
        docs: [],
        label: 'TokenPriceChanged'
      }
    ],
    lang_error: {
      displayName: ['ink', 'LangError'],
      type: 9
    },
    messages: [
      {
        args: [
          {
            label: 'new_owner',
            type: {
              displayName: ['AccountId'],
              type: 0
            }
          }
        ],
        default: false,
        docs: [],
        label: 'transfer_ownership',
        mutates: true,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 7
        },
        selector: '0x107e33ea'
      },
      {
        args: [
          {
            label: 'updater',
            type: {
              displayName: ['AccountId'],
              type: 0
            }
          }
        ],
        default: false,
        docs: [],
        label: 'set_updater',
        mutates: true,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 7
        },
        selector: '0x363c359e'
      },
      {
        args: [],
        default: false,
        docs: [],
        label: 'get_updater',
        mutates: false,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 10
        },
        selector: '0x831f1354'
      },
      {
        args: [
          {
            label: 'pair',
            type: {
              displayName: ['String'],
              type: 11
            }
          },
          {
            label: 'price',
            type: {
              displayName: ['u128'],
              type: 6
            }
          }
        ],
        default: false,
        docs: [],
        label: 'set_price',
        mutates: true,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 7
        },
        selector: '0x3df958af'
      },
      {
        args: [
          {
            label: 'pair',
            type: {
              displayName: ['String'],
              type: 11
            }
          }
        ],
        default: false,
        docs: [],
        label: 'get_latest_price',
        mutates: false,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 12
        },
        selector: '0x9b610c2e'
      },
      {
        args: [
          {
            label: 'pair',
            type: {
              displayName: ['String'],
              type: 11
            }
          }
        ],
        default: false,
        docs: [],
        label: 'get_price_history',
        mutates: false,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 14
        },
        selector: '0x8bf30111'
      },
      {
        args: [
          {
            label: 'pair',
            type: {
              displayName: ['String'],
              type: 11
            }
          },
          {
            label: 'index',
            type: {
              displayName: ['u32'],
              type: 15
            }
          },
          {
            label: 'length',
            type: {
              displayName: ['u32'],
              type: 15
            }
          }
        ],
        default: false,
        docs: [],
        label: 'get_price_history_by_index',
        mutates: false,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 14
        },
        selector: '0x1b2f6fd9'
      },
      {
        args: [
          {
            label: 'pair',
            type: {
              displayName: ['String'],
              type: 11
            }
          }
        ],
        default: false,
        docs: [],
        label: 'get_price_history_length',
        mutates: false,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 16
        },
        selector: '0xd2417dc0'
      },
      {
        args: [
          {
            label: 'pair',
            type: {
              displayName: ['String'],
              type: 11
            }
          },
          {
            label: 'timestamp',
            type: {
              displayName: ['u64'],
              type: 5
            }
          }
        ],
        default: false,
        docs: [],
        label: 'get_price_history_by_timestamp_and_binary_search',
        mutates: false,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 17
        },
        selector: '0x725a6bec'
      }
    ]
  },
  storage: {
    root: {
      layout: {
        struct: {
          fields: [
            {
              layout: {
                leaf: {
                  key: '0x00000000',
                  ty: 0
                }
              },
              name: 'owner'
            },
            {
              layout: {
                leaf: {
                  key: '0x00000000',
                  ty: 0
                }
              },
              name: 'updater'
            },
            {
              layout: {
                root: {
                  layout: {
                    leaf: {
                      key: '0xe08f55da',
                      ty: 3
                    }
                  },
                  root_key: '0xe08f55da'
                }
              },
              name: 'pairs'
            }
          ],
          name: 'TokenPriceStorage'
        }
      },
      root_key: '0x00000000'
    }
  },
  types: [
    {
      id: 0,
      type: {
        def: {
          composite: {
            fields: [
              {
                type: 1,
                typeName: '[u8; 32]'
              }
            ]
          }
        },
        path: ['ink_primitives', 'types', 'AccountId']
      }
    },
    {
      id: 1,
      type: {
        def: {
          array: {
            len: 32,
            type: 2
          }
        }
      }
    },
    {
      id: 2,
      type: {
        def: {
          primitive: 'u8'
        }
      }
    },
    {
      id: 3,
      type: {
        def: {
          sequence: {
            type: 4
          }
        }
      }
    },
    {
      id: 4,
      type: {
        def: {
          tuple: [5, 6]
        }
      }
    },
    {
      id: 5,
      type: {
        def: {
          primitive: 'u64'
        }
      }
    },
    {
      id: 6,
      type: {
        def: {
          primitive: 'u128'
        }
      }
    },
    {
      id: 7,
      type: {
        def: {
          variant: {
            variants: [
              {
                fields: [
                  {
                    type: 8
                  }
                ],
                index: 0,
                name: 'Ok'
              },
              {
                fields: [
                  {
                    type: 9
                  }
                ],
                index: 1,
                name: 'Err'
              }
            ]
          }
        },
        params: [
          {
            name: 'T',
            type: 8
          },
          {
            name: 'E',
            type: 9
          }
        ],
        path: ['Result']
      }
    },
    {
      id: 8,
      type: {
        def: {
          tuple: []
        }
      }
    },
    {
      id: 9,
      type: {
        def: {
          variant: {
            variants: [
              {
                index: 1,
                name: 'CouldNotReadInput'
              }
            ]
          }
        },
        path: ['ink_primitives', 'LangError']
      }
    },
    {
      id: 10,
      type: {
        def: {
          variant: {
            variants: [
              {
                fields: [
                  {
                    type: 0
                  }
                ],
                index: 0,
                name: 'Ok'
              },
              {
                fields: [
                  {
                    type: 9
                  }
                ],
                index: 1,
                name: 'Err'
              }
            ]
          }
        },
        params: [
          {
            name: 'T',
            type: 0
          },
          {
            name: 'E',
            type: 9
          }
        ],
        path: ['Result']
      }
    },
    {
      id: 11,
      type: {
        def: {
          primitive: 'str'
        }
      }
    },
    {
      id: 12,
      type: {
        def: {
          variant: {
            variants: [
              {
                fields: [
                  {
                    type: 13
                  }
                ],
                index: 0,
                name: 'Ok'
              },
              {
                fields: [
                  {
                    type: 9
                  }
                ],
                index: 1,
                name: 'Err'
              }
            ]
          }
        },
        params: [
          {
            name: 'T',
            type: 13
          },
          {
            name: 'E',
            type: 9
          }
        ],
        path: ['Result']
      }
    },
    {
      id: 13,
      type: {
        def: {
          variant: {
            variants: [
              {
                index: 0,
                name: 'None'
              },
              {
                fields: [
                  {
                    type: 4
                  }
                ],
                index: 1,
                name: 'Some'
              }
            ]
          }
        },
        params: [
          {
            name: 'T',
            type: 4
          }
        ],
        path: ['Option']
      }
    },
    {
      id: 14,
      type: {
        def: {
          variant: {
            variants: [
              {
                fields: [
                  {
                    type: 3
                  }
                ],
                index: 0,
                name: 'Ok'
              },
              {
                fields: [
                  {
                    type: 9
                  }
                ],
                index: 1,
                name: 'Err'
              }
            ]
          }
        },
        params: [
          {
            name: 'T',
            type: 3
          },
          {
            name: 'E',
            type: 9
          }
        ],
        path: ['Result']
      }
    },
    {
      id: 15,
      type: {
        def: {
          primitive: 'u32'
        }
      }
    },
    {
      id: 16,
      type: {
        def: {
          variant: {
            variants: [
              {
                fields: [
                  {
                    type: 15
                  }
                ],
                index: 0,
                name: 'Ok'
              },
              {
                fields: [
                  {
                    type: 9
                  }
                ],
                index: 1,
                name: 'Err'
              }
            ]
          }
        },
        params: [
          {
            name: 'T',
            type: 15
          },
          {
            name: 'E',
            type: 9
          }
        ],
        path: ['Result']
      }
    },
    {
      id: 17,
      type: {
        def: {
          variant: {
            variants: [
              {
                fields: [
                  {
                    type: 4
                  }
                ],
                index: 0,
                name: 'Ok'
              },
              {
                fields: [
                  {
                    type: 9
                  }
                ],
                index: 1,
                name: 'Err'
              }
            ]
          }
        },
        params: [
          {
            name: 'T',
            type: 4
          },
          {
            name: 'E',
            type: 9
          }
        ],
        path: ['Result']
      }
    },
    {
      id: 18,
      type: {
        def: {
          variant: {
            variants: [
              {
                index: 0,
                name: 'None'
              },
              {
                fields: [
                  {
                    type: 0
                  }
                ],
                index: 1,
                name: 'Some'
              }
            ]
          }
        },
        params: [
          {
            name: 'T',
            type: 0
          }
        ],
        path: ['Option']
      }
    },
    {
      id: 19,
      type: {
        def: {
          composite: {
            fields: [
              {
                type: 1,
                typeName: '[u8; 32]'
              }
            ]
          }
        },
        path: ['ink_primitives', 'types', 'Hash']
      }
    },
    {
      id: 20,
      type: {
        def: {
          variant: {}
        },
        path: ['ink_env', 'types', 'NoChainExtension']
      }
    }
  ],
  version: '4'
}
