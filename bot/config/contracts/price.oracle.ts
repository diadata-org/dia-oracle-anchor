export const ASSET_PRICE_ANCHOR_ABI = {
  source: {
    hash: '0xda530329a4c4b94d3f8f5c4b266b1aaca36651bcc5d3f439de2ebe54f47d160f',
    language: 'ink! 4.3.0',
    compiler: 'rustc 1.71.1',
    build_info: {
      build_mode: 'Release',
      cargo_contract_version: '3.2.0',
      rust_toolchain: 'stable-aarch64-apple-darwin',
      wasm_opt_settings: {
        keep_debug_symbols: false,
        optimization_passes: 'Z'
      }
    }
  },
  contract: {
    name: 'dia-oracle',
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
        type: 21
      },
      chainExtension: {
        displayName: ['ChainExtension'],
        type: 22
      },
      hash: {
        displayName: ['Hash'],
        type: 9
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
              type: 20
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
              type: 20
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
              type: 10
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
        args: [],
        default: false,
        docs: [],
        label: 'code_hash',
        mutates: false,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 8
        },
        selector: '0xbd69cea7'
      },
      {
        args: [
          {
            label: 'code_hash',
            type: {
              displayName: [],
              type: 1
            }
          }
        ],
        default: false,
        docs: [],
        label: 'set_code',
        mutates: true,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 5
        },
        selector: '0x694fb50f'
      },
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
              type: 10
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
        args: [
          {
            label: 'pairs',
            type: {
              displayName: ['Vec'],
              type: 11
            }
          }
        ],
        default: false,
        docs: [],
        label: 'OracleSetters::set_prices',
        mutates: true,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 5
        },
        selector: '0x0ed65cb0'
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
          type: 13
        },
        selector: '0xbcc301b4'
      },
      {
        args: [
          {
            label: 'pair',
            type: {
              displayName: ['String'],
              type: 10
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
          type: 14
        },
        selector: '0xbddfa62d'
      },
      {
        args: [
          {
            label: 'pairs',
            type: {
              displayName: ['Vec'],
              type: 17
            }
          }
        ],
        default: false,
        docs: [],
        label: 'OracleGetters::get_latest_prices',
        mutates: false,
        payable: false,
        returnType: {
          displayName: ['ink', 'MessageResult'],
          type: 18
        },
        selector: '0xf8e9c939'
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
                root: {
                  layout: {
                    struct: {
                      fields: [
                        {
                          layout: {
                            leaf: {
                              key: '0x00000001',
                              ty: 0
                            }
                          },
                          name: 'owner'
                        },
                        {
                          layout: {
                            leaf: {
                              key: '0x00000001',
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
                                          key: '0x0b0a1798',
                                          ty: 3
                                        }
                                      },
                                      name: '0'
                                    },
                                    {
                                      layout: {
                                        leaf: {
                                          key: '0x0b0a1798',
                                          ty: 4
                                        }
                                      },
                                      name: '1'
                                    }
                                  ],
                                  name: '(A, B)'
                                }
                              },
                              root_key: '0x0b0a1798'
                            }
                          },
                          name: 'pairs'
                        }
                      ],
                      name: 'TokenPriceStruct'
                    }
                  },
                  root_key: '0x00000001'
                }
              },
              name: 'data'
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
          variant: {
            variants: [
              {
                fields: [
                  {
                    type: 9
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
            type: 9
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
      id: 9,
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
      id: 10,
      type: {
        def: {
          primitive: 'str'
        }
      }
    },
    {
      id: 11,
      type: {
        def: {
          sequence: {
            type: 12
          }
        }
      }
    },
    {
      id: 12,
      type: {
        def: {
          tuple: [10, 4]
        }
      }
    },
    {
      id: 13,
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
      id: 14,
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
            type: 15
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
      id: 15,
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
                    type: 16
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
            type: 16
          }
        ],
        path: ['Option']
      }
    },
    {
      id: 16,
      type: {
        def: {
          tuple: [3, 4]
        }
      }
    },
    {
      id: 17,
      type: {
        def: {
          sequence: {
            type: 10
          }
        }
      }
    },
    {
      id: 18,
      type: {
        def: {
          variant: {
            variants: [
              {
                fields: [
                  {
                    type: 19
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
            type: 19
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
      id: 19,
      type: {
        def: {
          sequence: {
            type: 15
          }
        }
      }
    },
    {
      id: 20,
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
      id: 21,
      type: {
        def: {
          primitive: 'u32'
        }
      }
    },
    {
      id: 22,
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
