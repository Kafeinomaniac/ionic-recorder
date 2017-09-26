// Copyright (c) 2017 Tracktunes Inc

export class AppStorageMock {
    public get(key: string): Promise<any> {
        return new Promise((resolve, reject) => {
            resolve(null);
        });
    }
    public set(key: string, value: any): void {
        console.log('still an empty block in app state mock!');
    }
}
