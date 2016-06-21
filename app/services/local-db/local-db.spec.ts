// Copyright (c) 2016 Tracktunes Inc

import {
    LocalDB,
    TreeNode,
    DataNode,
    ParentChild,
    DB_NAME, DB_NO_KEY,
    DB_KEY_PATH, MAX_DB_INIT_TIME
} from './local-db';

const RANDOM_WORD_1: string =
    '1Wh9Xs5ytKuvEjdBhuLUVjED4dp5UPZd3QZFTLuejYNbuLvBVeP9Qq5xaBPAY7RE';
const RANDOM_WORD_2: string =
    '2Wh9Xs5ytKuvEjdBhuLUVjED4dp5UPZd3QZFTLuejYNbuLvBVeP9Qq5xaBPAY7RE';
const UNFILED_FOLDER_NAME: string = '__unfiled__';

let request: IDBOpenDBRequest = indexedDB.deleteDatabase(DB_NAME);

request.onsuccess = function (): void {
    // console.log('deleteDatabase: SUCCESS');
};

request.onerror = function (): void {
    console.warn('deleteDatabase: ERROR');
};

request.onblocked = function (): void {
    console.warn('deleteDatabase: BLOCKED');
};

let localDB: LocalDB = new LocalDB(),
    db: IDBDatabase = null,
    randomWord1: TreeNode,
    unfiledFolder: TreeNode,
    unfiledFolder2: TreeNode,
    folder1: TreeNode,
    folder3: TreeNode,
    folder5: TreeNode,
    item2: TreeNode,
    item4: TreeNode,
    item6: TreeNode,
    item7: TreeNode;

beforeEach((done: Function) => {
    localDB.waitForDB().subscribe(
        (database: IDBDatabase) => {
            db = database;
            done();
        },
        (error) => {
            fail(error);
        });
});

jasmine.DEFAULT_TIMEOUT_INTERVAL = MAX_DB_INIT_TIME * 10;

xdescribe('When localDB initialized', () => {
    it('localDB is not falsy', (done) => {
        setTimeout(
            () => {
                expect(localDB).not.toBeFalsy();
                done();
            },
            MAX_DB_INIT_TIME);
    });

    it('db is not falsy', (done) => {
        setTimeout(
            () => {
                expect(db).not.toBeFalsy();
                done();
            },
            MAX_DB_INIT_TIME);
    });

    it('db validating keys ok', (done) => {
        expect(localDB.validateKey(1)).toBeTruthy();
        expect(localDB.validateKey(0)).toBeFalsy();
        expect(localDB.validateKey(-1)).toBeFalsy();
        expect(localDB.validateKey(1.1)).toBeFalsy();
        done();
    });
});

xdescribe('When DB is available -- CREATING A TREE', () => {
    it('db is not falsy', (done) => {
        setTimeout(
            () => {
                expect(db).not.toBeFalsy();
                done();
            },
            MAX_DB_INIT_TIME);
    });

    it('can read or create RANDOM_WORD_1 item in root', (done) => {
        setTimeout(
            () => {
                localDB.readOrCreateDataNode(
                    RANDOM_WORD_1,
                    DB_NO_KEY,
                    RANDOM_WORD_2).subscribe(
                    (obj: any) => {
                        randomWord1 = obj.treeNode;
                        expect(obj.treeNode).not.toBeFalsy();
                        expect(obj.dataNode).not.toBeFalsy();
                        expect(obj.dataNode.data).toEqual(RANDOM_WORD_2);
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                    );
            },
            MAX_DB_INIT_TIME);
    });

    it('can read or create RANDOM_WORD_1 item in root again', (done) => {
        setTimeout(
            () => {
                localDB.readOrCreateDataNode(
                    RANDOM_WORD_1,
                    DB_NO_KEY,
                    RANDOM_WORD_2).subscribe(
                    (obj: any) => {
                        expect(obj.treeNode).not.toBeFalsy();
                        expect(obj.dataNode).not.toBeFalsy();
                        expect(obj.treeNode.name).toEqual(randomWord1.name);
                        expect(obj.dataNode.data).toEqual(RANDOM_WORD_2);
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                    );
            },
            MAX_DB_INIT_TIME);
    });

    it('can delete RANDOM_WORD_1 item in root', (done) => {
        setTimeout(
            () => {
                localDB.deleteNode(randomWord1).subscribe(
                    () => {
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            },
            MAX_DB_INIT_TIME);
    });

    it(
        'can read or create ' + UNFILED_FOLDER_NAME + ' folder (at root)',
        (done) => {
            setTimeout(
                () => {
                    localDB.readOrCreateFolderNode(
                        UNFILED_FOLDER_NAME, DB_NO_KEY).subscribe(
                        (treeNode: TreeNode) => {
                            unfiledFolder = treeNode;
                            expect(localDB.validateKey(
                                treeNode[DB_KEY_PATH])).toBe(true);
                            expect(treeNode.parentKey).toEqual(DB_NO_KEY);
                            expect(treeNode.dataKey).toBeFalsy();
                            expect(treeNode.name).toEqual(
                                UNFILED_FOLDER_NAME
                            );
                            expect(treeNode.timestamp).not.toBeFalsy();
                            done();
                        },
                        (error) => {
                            fail(error);
                        }
                        );
                },
                MAX_DB_INIT_TIME);
        });

    it(
        'can read or create ' + UNFILED_FOLDER_NAME + ' folder (at root)',
        (done) => {
            setTimeout(
                () => {
                    localDB.readOrCreateFolderNode(
                        UNFILED_FOLDER_NAME, DB_NO_KEY).subscribe(
                        (treeNode: TreeNode) => {
                            unfiledFolder = treeNode;
                            expect(localDB.validateKey(
                                treeNode[DB_KEY_PATH])).toBe(true);
                            expect(treeNode.parentKey).toEqual(DB_NO_KEY);
                            expect(treeNode.dataKey).toBeFalsy();
                            expect(treeNode.name).toEqual(
                                UNFILED_FOLDER_NAME
                            );
                            expect(treeNode.timestamp).not.toBeFalsy();
                            done();
                        },
                        (error) => {
                            fail(error);
                        }
                        );
                },
                MAX_DB_INIT_TIME);
        });

    it(
        'cannot create ' + UNFILED_FOLDER_NAME + ' folder (at root) again',
        (done) => {
            setTimeout(
                () => {
                    localDB.createNode(
                        UNFILED_FOLDER_NAME, DB_NO_KEY).subscribe(
                        (parentChild: ParentChild) => {
                            fail('expected an error');
                        },
                        (error) => {
                            expect(error).toEqual(
                                'unique name violation 3'
                            );
                            done();
                        }
                        );
                },
                MAX_DB_INIT_TIME);
        });

    it(
        'can create folder1 - child of ' + UNFILED_FOLDER_NAME + ' folder',
        (done) => {
            setTimeout(
                () => {
                    localDB.createNode(
                        'Folder 1',
                        unfiledFolder[DB_KEY_PATH]).subscribe(
                        (parentChild: ParentChild) => {
                            let treeNode: TreeNode = parentChild.child;
                            folder1 = treeNode;
                            expect(localDB.validateKey(
                                treeNode[DB_KEY_PATH])).toBe(true);
                            expect(treeNode.parentKey)
                                .toEqual(unfiledFolder[DB_KEY_PATH]);
                            expect(treeNode.dataKey).toBeFalsy();
                            expect(treeNode.name).toEqual('Folder 1');
                            expect(treeNode.timestamp).not.toBeFalsy();

                            unfiledFolder = parentChild.parent;

                            expect(unfiledFolder.childOrder).toEqual([
                                folder1[DB_KEY_PATH]
                            ]);

                            done();
                        },
                        (error) => {
                            fail(error);
                        }
                        );
                },
                MAX_DB_INIT_TIME);
        });

    it('can create item2 - child of folder1', (done) => {
        setTimeout(
            () => {
                localDB.createNode('Item 2', folder1[DB_KEY_PATH], 'i2data')
                    .subscribe(
                    (parentChild: ParentChild) => {
                        let treeNode: TreeNode = parentChild.child;
                        item2 = treeNode;
                        expect(localDB.validateKey(
                            treeNode[DB_KEY_PATH])).toBe(true);
                        expect(treeNode.parentKey).toEqual(
                            folder1[DB_KEY_PATH]);
                        expect(localDB.validateKey(treeNode.dataKey))
                            .toBe(true);
                        expect(treeNode.name).toEqual('Item 2');
                        expect(treeNode.timestamp).not.toBeFalsy();

                        folder1 = parentChild.parent;

                        expect(folder1.childOrder).toEqual([
                            item2[DB_KEY_PATH]
                        ]);

                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                    );
            },
            MAX_DB_INIT_TIME);
    });

    it('can create folder3 - child of folder1', (done) => {
        setTimeout(
            () => {
                localDB.createNode(
                    'Folder 3',
                    folder1[DB_KEY_PATH]).subscribe(
                    (parentChild: ParentChild) => {
                        let treeNode: TreeNode = parentChild.child;
                        folder3 = treeNode;
                        expect(localDB.validateKey(
                            treeNode[DB_KEY_PATH])).toBe(true);
                        expect(treeNode.parentKey).toEqual(
                            folder1[DB_KEY_PATH]);
                        expect(treeNode.dataKey).toBeFalsy();
                        expect(treeNode.name).toEqual('Folder 3');
                        expect(treeNode.timestamp).not.toBeFalsy();

                        folder1 = parentChild.parent;

                        expect(folder1.childOrder).toEqual([
                            folder3[DB_KEY_PATH],
                            item2[DB_KEY_PATH]
                        ]);
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                    );
            },
            MAX_DB_INIT_TIME);
    });

    it(
        'can create item4 - child of folder3',
        (done) => {
            setTimeout(
                () => {
                    localDB.createNode(
                        'Item 4',
                        folder3[DB_KEY_PATH],
                        'i4data').subscribe(
                        (parentChild: ParentChild) => {
                            let treeNode: TreeNode = parentChild.child;
                            item4 = treeNode;
                            expect(localDB.validateKey(
                                treeNode[DB_KEY_PATH])).toBe(true);
                            expect(treeNode.parentKey).toEqual(
                                folder3[DB_KEY_PATH]);
                            expect(localDB.validateKey(treeNode.dataKey))
                                .toBe(true);
                            expect(treeNode.name).toEqual('Item 4');
                            expect(treeNode.timestamp).not.toBeFalsy();

                            folder3 = parentChild.parent;

                            expect(folder3.childOrder).toEqual([
                                // folder1 is the only one in childOrder
                                item4[DB_KEY_PATH]
                            ]);

                            done();
                        },
                        (error) => {
                            fail(error);
                        }
                        );
                },
                MAX_DB_INIT_TIME);
        });

    it('can create folder5 - child of folder3', (done) => {
        setTimeout(
            () => {
                localDB.createNode(
                    'Folder 5',
                    folder3[DB_KEY_PATH]).subscribe(
                    (parentChild: ParentChild) => {
                        let treeNode: TreeNode = parentChild.child;
                        folder5 = treeNode;
                        expect(localDB.validateKey(
                            treeNode[DB_KEY_PATH])).toBe(true);
                        expect(treeNode.parentKey).toEqual(
                            folder3[DB_KEY_PATH]);
                        expect(treeNode.dataKey).toBeFalsy();
                        expect(treeNode.name).toEqual('Folder 5');
                        expect(treeNode.timestamp).not.toBeFalsy();

                        folder3 = parentChild.parent;

                        expect(folder3.childOrder).toEqual([
                            // folder1 is the only one in the childOrder
                            folder5[DB_KEY_PATH],
                            item4[DB_KEY_PATH]
                        ]);
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                    );
            },
            MAX_DB_INIT_TIME);
    });

    it('can create item6 - child of folder5', (done) => {
        setTimeout(
            () => {
                localDB.createNode('Item 6', folder5[DB_KEY_PATH], 'i6data')
                    .subscribe(
                    (parentChild: ParentChild) => {
                        let treeNode: TreeNode = parentChild.child;
                        item6 = treeNode;
                        expect(localDB.validateKey(
                            treeNode[DB_KEY_PATH])).toBe(true);
                        expect(treeNode.parentKey).toEqual(
                            folder5[DB_KEY_PATH]);
                        expect(localDB.validateKey(treeNode.dataKey))
                            .toBe(true);
                        expect(treeNode.name).toEqual('Item 6');
                        expect(treeNode.timestamp).not.toBeFalsy();

                        folder5 = parentChild.parent;

                        expect(folder5.childOrder).toEqual([
                            // folder1 is the only one in the childOrder
                            item6[DB_KEY_PATH]
                        ]);

                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                    );
            },
            MAX_DB_INIT_TIME);
    });

    it('can create item7 - child of folder5', (done) => {
        setTimeout(
            () => {
                localDB.createNode(
                    'Item 7',
                    folder5[DB_KEY_PATH],
                    'i7data').subscribe(
                    (parentChild: ParentChild) => {
                        let treeNode: TreeNode = parentChild.child;
                        item7 = treeNode;
                        expect(localDB.validateKey(
                            treeNode[DB_KEY_PATH])).toBe(true);
                        expect(treeNode.parentKey).toEqual(
                            folder5[DB_KEY_PATH]);
                        expect(localDB.validateKey(treeNode.dataKey))
                            .toBe(true);
                        expect(treeNode.name).toEqual('Item 7');
                        expect(treeNode.timestamp).not.toBeFalsy();

                        folder5 = parentChild.parent;

                        expect(folder5.childOrder).toEqual([
                            // folder1 is the only one in the childOrder
                            item7[DB_KEY_PATH],
                            item6[DB_KEY_PATH]
                        ]);

                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                    );
            },
            MAX_DB_INIT_TIME);
    });

    it(
        'can create ' + UNFILED_FOLDER_NAME + ' folder (at folder5)',
        (done) => {
            setTimeout(
                () => {
                    localDB.createNode(
                        UNFILED_FOLDER_NAME,
                        folder5[DB_KEY_PATH]).subscribe(
                        (parentChild: ParentChild) => {
                            unfiledFolder2 = parentChild.child;
                            let treeNode: TreeNode = parentChild.child;
                            expect(localDB.validateKey(
                                treeNode[DB_KEY_PATH])).toBe(true);
                            expect(treeNode.parentKey).toEqual(
                                folder5[DB_KEY_PATH]);
                            expect(treeNode.dataKey).toBeFalsy();
                            expect(treeNode.name).toEqual(
                                UNFILED_FOLDER_NAME
                            );
                            expect(treeNode.timestamp).not.toBeFalsy();

                            folder5 = parentChild.parent;

                            expect(folder5.childOrder).toEqual([
                                // folder1 is the only one in the childOrder
                                unfiledFolder2[DB_KEY_PATH],
                                item7[DB_KEY_PATH],
                                item6[DB_KEY_PATH]
                            ]);

                            done();
                        },
                        (error) => {
                            fail(error);
                        }
                        );
                },
                MAX_DB_INIT_TIME);
        });

    it('can read item2', (done) => {
        setTimeout(
            () => {
                localDB.readNode(item2[DB_KEY_PATH]).subscribe(
                    (treeNode: TreeNode) => {
                        expect(treeNode[DB_KEY_PATH]).not.toBeFalsy();
                        expect(treeNode[DB_KEY_PATH]).toEqual(
                            item2[DB_KEY_PATH]);
                        expect(treeNode.parentKey).toEqual(item2.parentKey);
                        expect(treeNode.dataKey).toEqual(item2.dataKey);
                        expect(treeNode.name).toEqual(item2.name);
                        expect(treeNode.timestamp).toEqual(item2.timestamp);
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            },
            MAX_DB_INIT_TIME);
    });

    it('can read item2 data', (done) => {
        setTimeout(
            () => {
                localDB.readNodeData(item2).subscribe(
                    (dataNode: DataNode) => {
                        expect(dataNode.data).toEqual('i2data');
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            },
            MAX_DB_INIT_TIME);
    });

    it('can update item2 data to "i2newData"', (done) => {
        setTimeout(
            () => {
                localDB.updateNodeData(item2, 'i2newData').subscribe(
                    () => {
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            },
            MAX_DB_INIT_TIME);
    });

    it(
        'can re-read item2 data and verify it to be "i2newData"',
        (done) => {
            setTimeout(
                () => {
                    localDB.readNodeData(item2).subscribe(
                        (dataNode: DataNode) => {
                            expect(dataNode.data).toEqual('i2newData');
                            done();
                        },
                        (error) => {
                            fail(error);
                        }
                    );
                },
                MAX_DB_INIT_TIME);
        });

    it(
        'can get child nodes of folder3 and verify them',
        (done) => {
            setTimeout(
                () => {
                    localDB.readChildNodes(folder3).subscribe(
                        (childNodes: TreeNode[]) => {
                            expect(childNodes.length).toEqual(2);
                            expect(childNodes).toContain(item4);
                            expect(childNodes).toContain(folder5);
                            done();
                        },
                        (error) => {
                            fail(error);
                        }
                    );
                },
                MAX_DB_INIT_TIME);
        });

    it('can get folder5 subtree nodes array', (done) => {
        setTimeout(
            () => {
                localDB.getSubtreeNodesArray(folder5)
                    .subscribe(
                    (nodes: TreeNode[]) => {
                        expect(nodes.length).toBe(3);
                        expect(nodes).toContain(item6);
                        expect(nodes).toContain(item7);
                        expect(nodes).toContain(unfiledFolder2);
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                    );
            },
            MAX_DB_INIT_TIME);
    });

    it('can get unfiledFolder subtree nodes', (done) => {
        setTimeout(
            () => {
                localDB.getSubtreeNodesArray(unfiledFolder)
                    .subscribe(
                    (nodes: TreeNode[]) => {
                        expect(nodes.length).toBe(8);
                        expect(nodes).toContain(folder1);
                        expect(nodes).toContain(item2);
                        expect(nodes).toContain(folder3);
                        expect(nodes).toContain(item4);
                        expect(nodes).toContain(folder5);
                        expect(nodes).toContain(item6);
                        expect(nodes).toContain(item7);
                        expect(nodes).toContain(unfiledFolder2);
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                    );
            },
            MAX_DB_INIT_TIME);
    });

    it('can delete folder5 folder recursively', (done) => {
        setTimeout(
            () => {
                let keyDict: { [id: string]: TreeNode; } = {};
                keyDict[folder5[DB_KEY_PATH]] = folder5;
                localDB.deleteNodes(keyDict).subscribe(
                    () => {
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            },
            MAX_DB_INIT_TIME);
    });

    it(
        'can get child nodes of folder3 and verify them but not folder5',
        (done) => {
            setTimeout(
                () => {
                    // verify detachment correctly updated childOrder
                    localDB.readNode(folder3[DB_KEY_PATH]).subscribe(
                        (node: TreeNode) => {
                            folder3 = node;
                            expect(node.childOrder.length).toEqual(1);
                            expect(node.childOrder).toContain(
                                item4[DB_KEY_PATH]);
                            expect(node.childOrder).not.toContain(
                                folder5[DB_KEY_PATH]);
                            done();
                        }
                    );
                },
                MAX_DB_INIT_TIME);
        });

    it('cannot now read folder5', (done) => {
        setTimeout(
            () => {
                localDB.readNode(folder5[DB_KEY_PATH]).subscribe(
                    (treeNode: TreeNode) => {
                        fail('expected an error');
                    },
                    (error) => {
                        expect(error).toEqual('node does not exist');
                        done();
                    }
                );
            },
            MAX_DB_INIT_TIME);
    });

    it('cannot now read item6', (done) => {
        setTimeout(
            () => {
                localDB.readNode(item6[DB_KEY_PATH]).subscribe(
                    (treeNode: TreeNode) => {
                        fail('expected an error');
                    },
                    (error) => {
                        expect(error).toEqual('node does not exist');
                        done();
                    }
                );
            },
            MAX_DB_INIT_TIME);
    });

    it('cannot now read item7', (done) => {
        setTimeout(
            () => {
                localDB.readNode(item7[DB_KEY_PATH]).subscribe(
                    (treeNode: TreeNode) => {
                        fail('expected an error');
                    },
                    (error) => {
                        expect(error).toEqual('node does not exist');
                        done();
                    }
                );
            },
            MAX_DB_INIT_TIME);
    });

    it(
        'can delete ' + UNFILED_FOLDER_NAME + ' folder recursively',
        (done) => {
            setTimeout(
                () => {
                    let keyDict: { [id: string]: TreeNode; } = {};
                    keyDict[unfiledFolder[DB_KEY_PATH]] = unfiledFolder;
                    localDB.deleteNodes(keyDict).subscribe(
                        () => {
                            done();
                        },
                        (error) => {
                            fail(error);
                        }
                    );
                },
                MAX_DB_INIT_TIME);
        });

    it(
        'cannot now read ' + UNFILED_FOLDER_NAME + ' folder (at root)',
        (done) => {
            setTimeout(
                () => {
                    localDB.readNode(unfiledFolder[DB_KEY_PATH]).subscribe(
                        (treeNode: TreeNode) => {
                            fail('expected an error');
                        },
                        (error) => {
                            expect(error).toEqual('node does not exist');
                            done();
                        }
                    );
                },
                MAX_DB_INIT_TIME);
        });

    it('cannot now read item2', (done) => {
        setTimeout(
            () => {
                localDB.readNode(item2[DB_KEY_PATH]).subscribe(
                    (treeNode: TreeNode) => {
                        fail('expected an error');
                    },
                    (error) => {
                        expect(error).toEqual('node does not exist');
                        done();
                    }
                );
            },
            MAX_DB_INIT_TIME);
    });

    it('cannot now read folder3', (done) => {
        setTimeout(
            () => {
                localDB.readNode(folder3[DB_KEY_PATH]).subscribe(
                    (treeNode: TreeNode) => {
                        fail('expected an error');
                    },
                    (error) => {
                        expect(error).toEqual('node does not exist');
                        done();
                    }
                );
            },
            MAX_DB_INIT_TIME);
    });

    it('cannot now read item4', (done) => {
        setTimeout(
            () => {
                localDB.readNode(item4[DB_KEY_PATH]).subscribe(
                    (treeNode: TreeNode) => {
                        fail('expected an error');
                    },
                    (error) => {
                        expect(error).toEqual('node does not exist');
                        done();
                    }
                );
            },
            MAX_DB_INIT_TIME);
    });

}); // xdescribe
