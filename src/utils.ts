import { snakeCase } from "snake-case";

export const blobToBase64 = (blob: Blob): Promise<string | null> => {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () =>
      resolve(reader.result?.toString().split(",")[1] || null);
    reader.readAsDataURL(blob);
  });
};

export const stringify = (obj: Object): string => {
  return JSON.stringify(obj, function (key, value) {
    if (value && typeof value === "object") {
      var replacement: { [key: string]: any } = {};
      for (var k in value) {
        if (Object.hasOwnProperty.call(value, k)) {
          replacement[k && snakeCase(k.toString())] = value[k];
        }
      }
      return replacement;
    }
    return value;
  });
};
