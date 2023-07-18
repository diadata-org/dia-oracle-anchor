export const ASSET_PRICE_ANCHOR_ABI = {
  source: {
    hash: '0xdaa5488dc4ffd0796225efb15534cddcd7c87339b6b4678e542abf65da2b9570',
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
          type: 5
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
        type: 4
      },
      blockNumber: {
        displayName: ['BlockNumber'],
        type: 16
      },
      chainExtension: {
        displayName: ['ChainExtension'],
        type: 17
      },
      hash: {
        displayName: ['Hash'],
        type: 15
      },
      maxEventTopics: 4,
      timestamp: {
        displayName: ['Timestamp'],
        type: 3
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
              type: 14
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
              type: 14
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
              type: 8
            }
          },
          {
            docs: [],
            indexed: false,
            label: 'price',
            type: {
              displayName: ['u128'],
              type: 4
            }
          },
          {
            docs: [],
            indexed: false,
            label: 'timestamp',
            type: {
              displayName: ['u64'],
              type: 3
            }
          }
        ],
        docs: [],
        label: 'TokenPriceChanged'
      }
    ],
    lang_error: {
      displayName: ['ink', 'LangError'],
      type: 7
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
        label: 'OracleSetters::transfer_ownership',
        mutates: true,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 5
        },
        selector: '0x4ecfa4b8'
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
        label: 'OracleSetters::set_updater',
        mutates: true,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 5
        },
        selector: '0xd9172755'
      },
      {
        args: [
          {
            label: 'pair',
            type: {
              displayName: ['String'],
              type: 8
            }
          },
          {
            label: 'price',
            type: {
              displayName: ['u128'],
              type: 4
            }
          }
        ],
        default: false,
        docs: [],
        label: 'OracleSetters::set_price',
        mutates: true,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 5
        },
        selector: '0xc812fda7'
      },
      {
        args: [],
        default: false,
        docs: [],
        label: 'OracleGetters::get_precision',
        mutates: true,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 9
        },
        selector: '0xf87a9bd6'
      },
      {
        args: [],
        default: false,
        docs: [],
        label: 'OracleGetters::get_updater',
        mutates: false,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 10
        },
        selector: '0xbcc301b4'
      },
      {
        args: [
          {
            label: 'pair',
            type: {
              displayName: ['String'],
              type: 8
            }
          }
        ],
        default: false,
        docs: [],
        label: 'OracleGetters::get_latest_price',
        mutates: false,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 11
        },
        selector: '0xbddfa62d'
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
                    struct: {
                      fields: [
                        {
                          layout: {
                            leaf: {
                              key: '0xe08f55da',
                              ty: 3
                            }
                          },
                          name: '0'
                        },
                        {
                          layout: {
                            leaf: {
                              key: '0xe08f55da',
                              ty: 4
                            }
                          },
                          name: '1'
                        }
                      ],
                      name: '(A, B)'
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
          primitive: 'u64'
        }
      }
    },
    {
      id: 4,
      type: {
        def: {
          primitive: 'u128'
        }
      }
    },
    {
      id: 5,
      type: {
        def: {
          variant: {
            variants: [
              {
                fields: [
                  {
                    type: 6
                  }
                ],
                index: 0,
                name: 'Ok'
              },
              {
                fields: [
                  {
                    type: 7
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
            type: 6
          },
          {
            name: 'E',
            type: 7
          }
        ],
        path: ['Result']
      }
    },
    {
      id: 6,
      type: {
        def: {
          tuple: []
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
      id: 8,
      type: {
        def: {
          primitive: 'str'
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
                    type: 7
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
            type: 7
          }
        ],
        path: ['Result']
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
                    type: 7
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
            type: 7
          }
        ],
        path: ['Result']
      }
    },
    {
      id: 11,
      type: {
        def: {
          variant: {
            variants: [
              {
                fields: [
                  {
                    type: 12
                  }
                ],
                index: 0,
                name: 'Ok'
              },
              {
                fields: [
                  {
                    type: 7
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
            type: 12
          },
          {
            name: 'E',
            type: 7
          }
        ],
        path: ['Result']
      }
    },
    {
      id: 12,
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
                    type: 13
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
            type: 13
          }
        ],
        path: ['Option']
      }
    },
    {
      id: 13,
      type: {
        def: {
          tuple: [3, 4]
        }
      }
    },
    {
      id: 14,
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
      id: 15,
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
      id: 16,
      type: {
        def: {
          primitive: 'u32'
        }
      }
    },
    {
      id: 17,
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
