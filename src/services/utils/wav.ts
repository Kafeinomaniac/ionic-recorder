// Copyright (c) 2016 Tracktunes Inc

// see: http://soundfile.sapp.org/doc/WaveFormat/
export function makeWavBlobHeaderView(
    nSamples: number,
    sampleRate: number
): DataView {
    'use strict';
    const arrayByteLength: number = nSamples * 2,
        headerView: DataView = new DataView(new ArrayBuffer(44)),
        writeAscii:
            (dataView: DataView, offset: number, text: string) => void =
            (dataView: DataView, offset: number, text: string) => {
                const len: number = text.length;
                for (let i: number = 0; i < len; i++) {
                    dataView.setUint8(offset + i, text.charCodeAt(i));
                }
            };
    //
    // NB: this is single-channel (mono)
    //

    //   0-4: ChunkId
    writeAscii(headerView, 0, 'RIFF');
    //   4-8: ChunkSize
    headerView.setUint32(4, 36 + arrayByteLength, true);
    //  8-12: Format
    writeAscii(headerView, 8, 'WAVE');
    // 12-16: Subchunk1ID
    writeAscii(headerView, 12, 'fmt ');
    // 16-20: Subchunk1Size
    headerView.setUint32(16, 16, true);
    // 20-22: AudioFormat
    headerView.setUint16(20, 1, true);
    // 22-24: NumChannels
    headerView.setUint16(22, 1, true);
    // 24-28: SampleRate
    headerView.setUint32(24, sampleRate, true);
    // 28-32: ByteRate
    headerView.setUint32(28, sampleRate * 2, true);
    // 32-34: BlockAlign
    headerView.setUint16(32, 2, true);
    // 34-36: BitsPerSample
    headerView.setUint16(34, 16, true);
    // 36-40: Subchunk2ID
    writeAscii(headerView, 36, 'data');
    // 40-44: Subchunk2Size
    headerView.setUint32(40, arrayByteLength, true);

    return headerView;
}

// NOTE: we cannot use the below
// (a) because some browsers don't support the url that's created
//     the way it's created here as the href field;
// (b) because chrome on android would not allow this - it considers
//     it to be a cross origin request, so at this point we cannot
//     download anyway on mobile...

// save data into a local file
export function downloadBlob(blob: Blob, fileName: string): void {
    'use strict';
    const url: string = window.URL.createObjectURL(blob);
    let anchorElement: HTMLAnchorElement = document.createElement('a');
    anchorElement.style.display = 'none';
    anchorElement.href = url;
    anchorElement.setAttribute('download', fileName);
    document.body.appendChild(anchorElement);
    anchorElement.click();
    setTimeout(
        () => {
            document.body.removeChild(anchorElement);
            window.URL.revokeObjectURL(url);
        },
        100);
    console.log('saveBlob(): finished!');
}
