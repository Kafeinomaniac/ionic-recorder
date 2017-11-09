// Copyright (c) 2017 Tracktunes Inc

export class HeartbeatMock {

    public addFunction(id: string, fun: () => void): void {
        console.log('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    }

    public removeFunction(id: string): void {
        console.log('rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr');
    }
}
