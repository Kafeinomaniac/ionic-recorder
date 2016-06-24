import {
    Dictionary
} from './dictionary';

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
        expect(dict.getValue('sd')).toBe(undefined);

        // test with string keys
        for (i = 0; i < nElements; i++) {
            expect(dict.setValue(elemKeys[i], i + 1)).toBe(undefined);
        }
        expect(dict.size()).toBe(nElements);

        for (i = 0; i < nElements; i++) {
            expect(dict.getValue(elemKeys[i])).toBe(i + 1);
        }

        dict.setValue('a', 5);
        expect(dict.getValue('a')).toBe(5);
        expect(dict.setValue('a', 21)).toBe(5);
        expect(dict.size()).toBe(nElements + 1);
        expect(dict.getValue('a')).toBe(21);
    });

    it('Maps keys to values with number keys', () => {
        // test with number keys
        for (i = 0; i < nElements; i++) {
            expect(dict.setValue(i, i + 1)).toBe(undefined);
        }

        for (i = 0; i < nElements; i++) {
            expect(dict.getValue(i)).toBe(i + 1);
        }
    });

    it('Maps keys to values with custom keys', () => {
        let ts: (obj: any) => any = (obj: any) => {
            return obj.s;
        };
        dict = new Dictionary(ts);
        expect(dict.getValue('sd')).toBe(undefined);

        for (i = 0; i < nElements; i++) {
            let o: any = {};
            o.s = elemKeys[i];
            expect(dict.setValue(o, i + 1)).toBe(undefined);
        }

        for (i = 0; i < nElements; i++) {
            let d: any = {};
            d.s = elemKeys[i];
            expect(dict.getValue(d)).toBe(i + 1);
        }
    });

    it('Removes existing elements from the dictionary', () => {
        expect(dict.remove('1')).toBe(undefined);
        for (i = 0; i < nElements; i++) {
            expect(dict.setValue(elemKeys[i], i + 1)).toBe(undefined);
        }
        expect(dict.size()).toBe(nElements);
        for (i = 0; i < nElements; i++) {
            expect(dict.remove(elemKeys[i])).toBe(i + 1);
            expect(dict.getValue(elemKeys[i])).toBe(undefined);
            expect(dict.remove(elemKeys[i])).toBe(undefined);
        }
        expect(dict.size()).toBe(0);
    });

    it('An empty dictionary is empty', () => {
        expect(dict.isEmpty()).toBe(true);
        dict.setValue('1', 1);
        expect(dict.isEmpty()).toBe(false);
        dict.remove('1');
        expect(dict.isEmpty()).toBe(true);
    });

    it('Clear removes all elements', () => {
        dict.clear();
        dict.setValue(1, 1);
        dict.clear();
        expect(dict.isEmpty()).toBe(true);
        expect(dict.getValue(1)).toBe(undefined);
    });

    it('Contains existing keys', () => {
        expect(dict.containsKey(0)).toBe(false);
        for (i = 0; i < 10; i++) {
            dict.setValue(elemKeys[i], i);
            expect(dict.containsKey(elemKeys[i])).toBe(true);
        }
        for (i = 0; i < 10; i++) {
            dict.remove(elemKeys[i]);
            expect(dict.containsKey(elemKeys[i])).toBe(false);
        }
    });

    it('Gives the right size', () => {
        expect(dict.size()).toBe(0);
        for (i = 0; i < 10; i++) {
            dict.setValue(elemKeys[i], i);
            expect(dict.size()).toBe(i + 1);
        }
    });

    it('Gives all the stored keys', () => {
        let k: any[] = [],
            keys: any[];
        for (i = 0; i < nElements; i++) {
            keys = dict.keys();
            k.sort();
            keys.sort();
            expect(k).toEqual(keys);
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
            expect(v).toEqual(values);
            dict.setValue(elemKeys[i], i);
            v.push(i);
        }
    });

    it('For each gives all the pairs', () => {
        let keys: Set<number>,
            values: Set<number>;
        for (i = 0; i < nElements; i++) {
            dict.setValue(elemKeys[i], i);
        }
        keys = new Set<number>(dict.keys());
        values = new Set<number>(dict.values());
        dict.forEach((k: any, v: any) => {
            expect(keys.delete(k)).toBe(true);
            expect(values.delete(v)).toBe(true);
        });
        expect(keys.size).toBe(0);
        expect(values.size).toBe(0);
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
        expect(t).toBe(1);
    });

});
