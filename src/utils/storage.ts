function get<T>(property: string): Promise<T> {
  return new Promise(resolve => {
    chrome.storage.sync.get(property, value => {
      resolve(value[property])
    });
  })
}

function set(key: string, value: any) {
  return chrome.storage.sync.set({ [key]: value });
}

export default {
  get,
  set
}