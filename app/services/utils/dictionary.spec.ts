import {
    Dictionary
} from './dictionary';

import {
    equals,
    remove
} from './arrays';

let dict: Dictionary<any, any> = null,
    nElements: number = 100,
    elemKeys: any = [],
    i: number;

for (i = 0; i < nElements; i++) {
    elemKeys[i] = '' + i;
}

// Test with some potentially problematic keys
elemKeys[2] = 'hasOwnProperty';
elemKeys[4] = '__proto__';
elemKeys[6] = '';

describe('Dictionary', () => {

    beforeEach(() => {
        dict = new Dictionary();
    });

    it('Maps keys to values with string keys', () => {
        expect(dict.getValue('sd')).toEqual(undefined);

        // test with string keys
        for (i = 0; i < nElements; i++) {
            expect(dict.setValue(elemKeys[i], i + 1)).toEqual(undefined);
        }
        expect(dict.size()).toEqual(nElements);

        for (i = 0; i < nElements; i++) {
            expect(dict.getValue(elemKeys[i])).toEqual(i + 1);
        }

        dict.setValue('a', 5);
        expect(dict.getValue('a')).toEqual(5);
        expect(dict.setValue('a', 21)).toEqual(5);
        expect(dict.size()).toEqual(nElements + 1);
        expect(dict.getValue('a')).toEqual(21);
    });

    it('Maps keys to values with number keys', () => {
        // test with number keys
        for (i = 0; i < nElements; i++) {
            expect(dict.setValue(i, i + 1)).toEqual(undefined);
        }

        for (i = 0; i < nElements; i++) {
            expect(dict.getValue(i)).toEqual(i + 1);
        }
    });

    it('Maps keys to values with custom keys', () => {
        let ts: (obj: any) => any = (obj: any) => {
            return obj.s;
        };
        dict = new Dictionary(ts);
        expect(dict.getValue('sd')).toEqual(undefined);

        for (i = 0; i < nElements; i++) {
            let o: any = {};
            o.s = elemKeys[i];
            expect(dict.setValue(o, i + 1)).toEqual(undefined);
        }

        for (i = 0; i < nElements; i++) {
            let d: any = {};
            d.s = elemKeys[i];
            expect(dict.getValue(d)).toEqual(i + 1);
        }
    });

    it('Removes existing elements from the dictionary', () => {
        expect(dict.remove('1')).toEqual(undefined);
        for (i = 0; i < nElements; i++) {
            expect(dict.setValue(elemKeys[i], i + 1)).toEqual(undefined);
        }
        expect(dict.size()).toEqual(nElements);
        for (i = 0; i < nElements; i++) {
            expect(dict.remove(elemKeys[i])).toEqual(i + 1);
            expect(dict.getValue(elemKeys[i])).toEqual(undefined);
            expect(dict.remove(elemKeys[i])).toEqual(undefined);
        }
        expect(dict.size()).toEqual(0);
    });

    it('An empty dictionary is empty', () => {
        expect(dict.isEmpty()).toEqual(true);
        dict.setValue('1', 1);
        expect(dict.isEmpty()).toEqual(false);
        dict.remove('1');
        expect(dict.isEmpty()).toEqual(true);
    });

    it('Clear removes all elements', () => {
        dict.clear();
        dict.setValue(1, 1);
        dict.clear();
        expect(dict.isEmpty()).toEqual(true);
        expect(dict.getValue(1)).toEqual(undefined);
    });

    it('Contains existing keys', () => {
        expect(dict.containsKey(0)).toEqual(false);
        for (i = 0; i < 10; i++) {
            dict.setValue(elemKeys[i], i);
            expect(dict.containsKey(elemKeys[i])).toEqual(true);
        }
        for (i = 0; i < 10; i++) {
            dict.remove(elemKeys[i]);
            expect(dict.containsKey(elemKeys[i])).toEqual(false);
        }
    });

    it('Gives the right size', () => {
        expect(dict.size()).toEqual(0);
        for (i = 0; i < 10; i++) {
            dict.setValue(elemKeys[i], i);
            expect(dict.size()).toEqual(i + 1);
        }
    });

    it('Gives all the stored keys', () => {
        let k: any[] = [],
            keys: any[];
        for (i = 0; i < nElements; i++) {
            keys = dict.keys();
            k.sort();
            keys.sort();
            expect(equals(k, keys)).toEqual(true);
            dict.setValue(elemKeys[i], i);
            k.push(elemKeys[i]);
        }
    });

    it('Gives all the stored values', () => {
        let v: any[] = [],
            values: any[];
        for (i = 0; i < nElements; i++) {
            values = dict.values();
            v.sort();
            values.sort();
            expect(equals(v, values)).toEqual(true);
            dict.setValue(elemKeys[i], i);
            v.push(i);
        }
    });

    it('For each gives all the pairs', () => {
        let keys: any[],
            values: any[];
        for (i = 0; i < nElements; i++) {
            dict.setValue(elemKeys[i], i);
        }
        keys = dict.keys();
        values = dict.values();
        dict.forEach((k: any, v: any) => {
            expect(remove(keys, k)).toEqual(true);
            expect(remove(values, v)).toEqual(true);
        });
        expect(keys.length).toEqual(0);
        expect(values.length).toEqual(0);
    });

    it('For each can be interrupted', () => {
        for (i = 0; i < nElements; i++) {
            dict.setValue(elemKeys[i], i);
        }
        let t: number = 0;
        dict.forEach((k: any, v: any) => {
            t++;
            return false;
        });
        expect(t).toEqual(1);
    });

});
