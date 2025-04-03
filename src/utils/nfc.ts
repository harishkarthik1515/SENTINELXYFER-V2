export const checkNFCSupport = (): boolean => {
  return 'NDEFReader' in window;
};

export const startNFCReader = async (): Promise<any> => {
  try {
    const ndef = new (window as any).NDEFReader();
    await ndef.scan();
    return ndef;
  } catch (error) {
    throw new Error('Failed to start NFC reader');
  }
};

export const writeToNFCTag = async (data: string): Promise<void> => {
  try {
    const ndef = new (window as any).NDEFReader();
    await ndef.write({ records: [{ recordType: "text", data }] });
  } catch (error) {
    throw new Error('Failed to write to NFC tag');
  }
};