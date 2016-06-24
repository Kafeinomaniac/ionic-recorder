// Copyright (c) 2016 Tracktunes Inc

// The javascript Set<T> is ordered so we use it
// for every key/element pair we have we add the pair
// (key, element) to an ordered dict, but we make sure element
// is a pointer to an element, not the element itself, because
// we want to let the element change without creating a new set
// item. we can safely add an array of key/value

export class OrderedDict<T> extends Set<T> {
    constructor() {
        super();
    }

    get

}
