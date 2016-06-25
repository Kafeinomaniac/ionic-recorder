// Copyright (c) 2016 Tracktunes Inc

import {
    IdbFS,
    TreeNode,
    DB_KEY_PATH,
    ParentChild
} from './idb-fs';

const WAIT_MSEC: number = 60;

const ROOT_FOLDER_NAME: string = 'root';

const DB_NAME: string = 'f';

const DB_VERSION: number = 3;

IdbFS.deleteDb(DB_NAME).subscribe();

let folder1: TreeNode,
    folder2: TreeNode,
    folder3: TreeNode,
    folder4: TreeNode,
    item1: TreeNode,
    item2: TreeNode,
    item3: TreeNode,
    item4: TreeNode,
    idbFS: IdbFS = new IdbFS(
        DB_NAME,
        DB_VERSION,
        ROOT_FOLDER_NAME
    );

beforeEach((done: Function) => {
    idbFS.waitForDB().subscribe(
        () => {
            done();
        },
        (error) => {
            fail(error);
        });
});

// jasmine.DEFAULT_TIMEOUT_INTERVAL = WAIT_MSEC;

describe('services/idb:IdbFS', () => {
    it('initializes', (done) => {
        setTimeout(
            () => {
                expect(idbFS).not.toBeFalsy();
                done();
            },
            WAIT_MSEC);
    });

    it('can make nodes and test them', (done) => {
        setTimeout(
            () => {
                // verify folder node creation
                let node: TreeNode = IdbFS.makeTreeNode('test');
                expect(IdbFS.isFolderNode(node)).toBe(true);
                expect(IdbFS.isDataNode(node)).toBe(false);
                expect(node['parentKey']).toBe(null);
                expect(node['data']).toBe(undefined);
                expect(node[DB_KEY_PATH]).toBeUndefined();

                // invalid parentKey tests
                node['parentKey'] = 0;
                try {
                    IdbFS.makeTreeNode('test', 0, 'data');
                }
                catch (error) {
                    expect(error.toString())
                        .toEqual('Error: makeTreeNode(): invalid parentKey');
                }
                try {
                    IdbFS.makeTreeNode('test', 1.1, 'data');
                }
                catch (error) {
                    expect(error.toString())
                        .toEqual('Error: makeTreeNode(): invalid parentKey');
                }
                try {
                    IdbFS.makeTreeNode('test', Infinity, 'data');
                }
                catch (error) {
                    expect(error.toString())
                        .toEqual('Error: makeTreeNode(): invalid parentKey');
                }

                // verify data node creation
                node = IdbFS.makeTreeNode('test', 111, 'data');
                expect(IdbFS.isFolderNode(node)).toEqual(false);
                expect(IdbFS.isDataNode(node)).toEqual(true);
                expect(node.parentKey).toEqual(111);
                expect(node.data).toEqual('data');
                done();
            },
            WAIT_MSEC);
    });

    it('can read root folder (' + ROOT_FOLDER_NAME + ')', (done) => {
        setTimeout(
            () => {
                idbFS.readNode(1).subscribe(
                    (rootNode: TreeNode) => {
                        expect(rootNode.childOrder).toBeDefined();
                        expect(rootNode[DB_KEY_PATH]).toBe(1);
                    },
                    (error) => {
                        fail(error);
                    }
                );

                done();
            },
            WAIT_MSEC);
    });

    it('can create folder1, child of ' + ROOT_FOLDER_NAME, (done) => {
        setTimeout(
            () => {
                idbFS.createNode('folder1', 1).subscribe(
                    (parentChild: ParentChild) => {
                        folder1 = parentChild.child;
                        expect(folder1.parentKey).toBe(1);
                        expect(folder1.data).toBeUndefined();
                        expect(parentChild.parent[DB_KEY_PATH]).toBe(1);

                        done();
                    },
                    (error) => {
                        fail(error);
                    });
            },
            WAIT_MSEC);
    });

    it('can create item1, child of folder1', (done) => {
        setTimeout(
            () => {
                idbFS.createNode(
                    'item1',
                    folder1[DB_KEY_PATH],
                    'item1 datum'
                ).subscribe(
                    (parentChild: ParentChild) => {
                        item1 = parentChild.child;
                        expect(item1.parentKey).toBe(folder1[DB_KEY_PATH]);
                        expect(item1['data']).toBe('item1 datum');
                        expect(item1.timeStamp).not.toBeFalsy();
                        folder1 = parentChild.parent;
                        expect(folder1.childOrder).toEqual([
                            item1[DB_KEY_PATH]
                        ]);
                        expect(item1[DB_KEY_PATH]).toBe(3);

                        done();
                    },
                    (error) => {
                        fail(error);
                    });
            },
            WAIT_MSEC);
    });

    it('can create folder2, child of folder1', (done) => {
        setTimeout(
            () => {
                idbFS.createNode(
                    'folder2',
                    folder1[DB_KEY_PATH]).subscribe(
                    (parentChild: ParentChild) => {
                        folder2 = parentChild.child;
                        expect(folder2.parentKey).toBe(folder1[DB_KEY_PATH]);
                        expect(folder2['data']).toBeUndefined();
                        expect(folder2.name).toEqual('folder2');
                        expect(folder2.timeStamp).not.toBeFalsy();
                        folder1 = parentChild.parent;
                        expect(folder1.childOrder).toEqual([
                            folder2[DB_KEY_PATH],
                            item1[DB_KEY_PATH]
                        ]);
                        done();
                    },
                    (error) => {
                        fail(error);
                    });
            },
            WAIT_MSEC);
    });

    it('can create item2, child of folder2', (done) => {
        setTimeout(
            () => {
                idbFS.createNode(
                    'item2',
                    folder2[DB_KEY_PATH],
                    'item2 datum').subscribe(
                    (parentChild: ParentChild) => {
                        item2 = parentChild.child;
                        expect(item2.parentKey).toEqual(folder2[DB_KEY_PATH]);
                        expect(item2.name).toEqual('item2');
                        expect(item2.data).toBe('item2 datum');
                        expect(item2.timeStamp).not.toBeFalsy();
                        folder2 = parentChild.parent;
                        expect(folder2.childOrder).toEqual([
                            item2[DB_KEY_PATH]
                        ]);

                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                    );
            },
            WAIT_MSEC);
    });

    it('can create folder3, child of folder2', (done) => {
        setTimeout(
            () => {
                idbFS.createNode(
                    'folder3',
                    folder2[DB_KEY_PATH]).subscribe(
                    (parentChild: ParentChild) => {
                        folder3 = parentChild.child;
                        expect(folder3.parentKey).toEqual(
                            folder2[DB_KEY_PATH]);
                        expect(folder3['data']).toBeUndefined();
                        expect(folder3.name).toEqual('folder3');
                        expect(folder3.timeStamp).not.toBeFalsy();
                        folder2 = parentChild.parent;
                        expect(folder2.childOrder).toEqual([
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
            WAIT_MSEC);
    });

    it('can get child nodes of folder2 and verify them', (done) => {
        setTimeout(
            () => {
                idbFS.readChildNodes(folder2).subscribe(
                    (childNodes: TreeNode[]) => {
                        console.log('hi');
                        expect(childNodes.length).toEqual(2);
                        expect(childNodes).toContain(item2);
                        expect(childNodes).toContain(folder3);
                        done();
                    },
                    (error) => {
                        fail(error);
                    },
                    () => {
                        console.log('done!');
                    }
                );
            },
            WAIT_MSEC);
    });

    it('can create item3, child of folder3', (done) => {
        setTimeout(
            () => {
                idbFS.createNode('item3', folder3[DB_KEY_PATH], 'i6data')
                    .subscribe(
                    (parentChild: ParentChild) => {
                        item3 = parentChild.child;
                        expect(item3.parentKey).toEqual(
                            folder3[DB_KEY_PATH]);
                        expect(item3.name).toEqual('item3');
                        expect(item3.data).toBe('i6data');
                        expect(item3.timeStamp).not.toBeFalsy();
                        folder3 = parentChild.parent;
                        expect(folder3.childOrder).toEqual([
                            item3[DB_KEY_PATH]
                        ]);

                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                    );
            },
            WAIT_MSEC);
    });

    it('can create item4, child of folder3', (done) => {
        setTimeout(
            () => {
                idbFS.createNode(
                    'item4',
                    folder3[DB_KEY_PATH],
                    'i4data').subscribe(
                    (parentChild: ParentChild) => {
                        item4 = parentChild.child;
                        expect(item4.parentKey).toEqual(folder3[DB_KEY_PATH]);
                        expect(item4.name).toEqual('item4');
                        expect(item4.data).toBe('i4data');
                        expect(item4.timeStamp).not.toBeFalsy();
                        folder3 = parentChild.parent;
                        expect(folder3.childOrder).toEqual([
                            item4[DB_KEY_PATH],
                            item3[DB_KEY_PATH]
                        ]);

                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                    );
            },
            WAIT_MSEC);
    });

    it(
        'can create folder4, child of folder3', (done) => {
            setTimeout(
                () => {
                    idbFS.createNode(
                        'folder4',
                        folder3[DB_KEY_PATH]).subscribe(
                        (parentChild: ParentChild) => {
                            folder4 = parentChild.child;
                            expect(folder4.parentKey).toEqual(
                                folder3[DB_KEY_PATH]);
                            expect(folder4['data']).toBeUndefined();
                            expect(folder4.name).toEqual('folder4');
                            expect(folder4.timeStamp).not.toBeFalsy();
                            folder3 = parentChild.parent;
                            expect(folder3.childOrder).toEqual([
                                folder4[DB_KEY_PATH],
                                item4[DB_KEY_PATH],
                                item3[DB_KEY_PATH]
                            ]);

                            done();
                        },
                        (error) => {
                            fail(error);
                        }
                        );
                },
                WAIT_MSEC);
        });

    it('can read item1', (done) => {
        setTimeout(
            () => {
                idbFS.readNode(item1[DB_KEY_PATH]).subscribe(
                    (treeNode: TreeNode) => {
                        expect(treeNode[DB_KEY_PATH]).not.toBeFalsy();
                        expect(treeNode[DB_KEY_PATH]).toEqual(
                            item1[DB_KEY_PATH]);
                        expect(treeNode.parentKey).toEqual(item1.parentKey);
                        expect(treeNode['data']).toEqual(item1['data']);
                        expect(treeNode.name).toEqual(item1.name);
                        expect(treeNode.timeStamp).toEqual(item1.timeStamp);
                        done();
                    },
                    (error) => {
                        fail(error);
                    }
                );
            },
            WAIT_MSEC);
    });

    // it('can get folder3 subtree nodes array', (done) => {
    //     setTimeout(
    //         () => {
    //             idbFS.getSubtreeNodesArray(folder3)
    //                 .subscribe(
    //                 (nodes: TreeNode[]) => {
    //                     expect(nodes.length).toBe(3);
    //                     expect(nodes).toContain(item3);
    //                     expect(nodes).toContain(item4);
    //                     expect(nodes).toContain(unfiledFolder2);
    //                     done();
    //                 },
    //                 (error) => {
    //                     fail(error);
    //                 }
    //                 );
    //         },
    //         WAIT_MSEC);
    // });

    // it('can get unfiledfoldersubtree nodes', (done) => {
    //     setTimeout(
    //         () => {
    //             idbFS.getSubtreeNodesArray(unfiledFolder).subscribe(
    //                 (nodes: TreeNode[]) => {
    //                     expect(nodes.length).toBe(8);
    //                     expect(nodes).toContain(folder1);
    //                     expect(nodes).toContain(item1);
    //                     expect(nodes).toContain(folder2);
    //                     expect(nodes).toContain(item2);
    //                     expect(nodes).toContain(folder3);
    //                     expect(nodes).toContain(item3);
    //                     expect(nodes).toContain(item4);
    //                     expect(nodes).toContain(unfiledFolder2);
    //                     done();
    //                 },
    //                 (error) => {
    //                     fail(error);
    //                 }
    //                 );
    //         },
    //         WAIT_MSEC);
    // });

    // it('can delete folder3 folder recursively', (done) => {
    //     setTimeout(
    //         () => {
    //             let keyDict: { [id: string]: TreeNode; } = {};
    //             keyDict[folder3[DB_KEY_PATH]] = folder3;
    //             idbFS.deleteNodes(keyDict).subscribe(
    //                 () => {
    //                     done();
    //                 },
    //                 (error) => {
    //                     fail(error);
    //                 }
    //             );
    //         },
    //         WAIT_MSEC);
    // });

    // it(
    //     'can get child nodes of folder2 and verify them but not folder3',
    //     (done) => {
    //         setTimeout(
    //             () => {
    //                 // verify detachment correctly updated childOrder
    //                 idbFS.readNode(folder2[DB_KEY_PATH]).subscribe(
    //                     (node: TreeNode) => {
    //                         folder2 = node;
    //                         expect(node.childOrder.length).toEqual(1);
    //                         expect(node.childOrder).toContain(
    //                             item2[DB_KEY_PATH]);
    //                         expect(node.childOrder).not.toContain(
    //                             folder3[DB_KEY_PATH]);
    //                         done();
    //                     }
    //                 );
    //             },
    //             WAIT_MSEC);
    //     });

    // it('cannot now read folder3', (done) => {
    //     setTimeout(
    //         () => {
    //             idbFS.readNode(folder3[DB_KEY_PATH]).subscribe(
    //                 (treeNode: TreeNode) => {
    //                     fail('expected an error');
    //                 },
    //                 (error) => {
    //                     expect(error).toEqual('node does not exist');
    //                     done();
    //                 }
    //             );
    //         },
    //         WAIT_MSEC);
    // });

    // it('cannot now read item3', (done) => {
    //     setTimeout(
    //         () => {
    //             idbFS.readNode(item3[DB_KEY_PATH]).subscribe(
    //                 (treeNode: TreeNode) => {
    //                     fail('expected an error');
    //                 },
    //                 (error) => {
    //                     expect(error).toEqual('node does not exist');
    //                     done();
    //                 }
    //             );
    //         },
    //         WAIT_MSEC);
    // });

    // it('cannot now read item4', (done) => {
    //     setTimeout(
    //         () => {
    //             idbFS.readNode(item4[DB_KEY_PATH]).subscribe(
    //                 (treeNode: TreeNode) => {
    //                     fail('expected an error');
    //                 },
    //                 (error) => {
    //                     expect(error).toEqual('node does not exist');
    //                     done();
    //                 }
    //             );
    //         },
    //         WAIT_MSEC);
    // });

    // it(
    //     'can delete ' + UNFILED_FOLDER_NAME + ' folder recursively',
    //     (done) => {
    //         setTimeout(
    //             () => {
    //                 let keyDict: { [id: string]: TreeNode; } = {};
    //                 keyDict[unfiledFolder[DB_KEY_PATH]] = unfiledFolder;
    //                 idbFS.deleteNodes(keyDict).subscribe(
    //                     () => {
    //                         done();
    //                     },
    //                     (error) => {
    //                         fail(error);
    //                     }
    //                 );
    //             },
    //             WAIT_MSEC);
    //     });

    // it(
    //     'cannot now read ' + UNFILED_FOLDER_NAME + ' folder (at root)',
    //     (done) => {
    //         setTimeout(
    //             () => {
    //                 idbFS.readNode(unfiledFolder[DB_KEY_PATH]).subscribe(
    //                     (treeNode: TreeNode) => {
    //                         fail('expected an error');
    //                     },
    //                     (error) => {
    //                         expect(error).toEqual('node does not exist');
    //                         done();
    //                     }
    //                 );
    //             },
    //             WAIT_MSEC);
    //     });

    // it('cannot now read item1', (done) => {
    //     setTimeout(
    //         () => {
    //             idbFS.readNode(item1[DB_KEY_PATH]).subscribe(
    //                 (treeNode: TreeNode) => {
    //                     fail('expected an error');
    //                 },
    //                 (error) => {
    //                     expect(error).toEqual('node does not exist');
    //                     done();
    //                 }
    //             );
    //         },
    //         WAIT_MSEC);
    // });

    // it('cannot now read folder2', (done) => {
    //     setTimeout(
    //         () => {
    //             idbFS.readNode(folder2[DB_KEY_PATH]).subscribe(
    //                 (treeNode: TreeNode) => {
    //                     fail('expected an error');
    //                 },
    //                 (error) => {
    //                     expect(error).toEqual('node does not exist');
    //                     done();
    //                 }
    //             );
    //         },
    //         WAIT_MSEC);
    // });

    // it('cannot now read item2', (done) => {
    //     setTimeout(
    //         () => {
    //             idbFS.readNode(item2[DB_KEY_PATH]).subscribe(
    //                 (treeNode: TreeNode) => {
    //                     fail('expected an error');
    //                 },
    //                 (error) => {
    //                     expect(error).toEqual('node does not exist');
    //                     done();
    //                 }
    //             );
    //         },
    //         WAIT_MSEC);
    // });

});
