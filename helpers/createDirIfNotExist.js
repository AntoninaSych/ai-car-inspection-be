import fs from "fs/promises";

const createDirIfNotExist = async (dir) => {
  await fs
    .access(dir)
    .then(() => undefined)
    .catch(() => fs.mkdir(dir, { recursive: true }));
};

export default createDirIfNotExist;
