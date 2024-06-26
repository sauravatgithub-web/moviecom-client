export const renameFile = (filename) => {
    const lastDotIndex = filename.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      return filename.substring(0, lastDotIndex); 
    }
    return filename;
}