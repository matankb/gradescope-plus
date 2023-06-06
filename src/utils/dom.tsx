import log from "./log";

export function waitForLoad<T>(condition: () => T, root = document.body): Promise<T> {

  return new Promise(res => {

    const resolvedCondition = condition();
    if (resolvedCondition) {
      return res(resolvedCondition);
    }

    const observer = new MutationObserver(() => {
      const resolvedCondition = condition(); // eslint-disable-line no-shadow
      if (resolvedCondition) {
        res(resolvedCondition);
        observer.disconnect();
      }
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
    });
  });

}

export function waitForOne(
  condition: () => NodeList | HTMLElement[],
  filterNull?: boolean,
  root = document.body,
): Promise<HTMLElement[]> {
  return waitForLoad(() => {
    const resolvedCondition = condition();
    if (!(resolvedCondition instanceof NodeList) && !(resolvedCondition instanceof Array)) {
      log('warn', 'waitForOne condition should return an NodeList');
    }
    if (resolvedCondition && resolvedCondition.length) {
      if (filterNull) {
        const filtered = Array.from(resolvedCondition).filter(k => k !== null);
        return filtered.length && filtered as HTMLElement[];
      }
      return Array.from(resolvedCondition) as HTMLElement[];
    }
  }, root);
}

function htmlToElement(html: string) {
  const parent = document.createElement('div');
  parent.innerHTML = html;
  return parent.firstElementChild;
}

export function constructButton(name: string, icon: string, onClick: EventListener) {
  const button = htmlToElement(`
    <a class="btnv7 btnv7-secondary btnv7-subdued" href="#">
      <span>
        <i class="fa fa-${icon}" role="img" aria-hidden="true"></i>
        <span>${name}</span>
      <span> 
    </a>
  `);
  button.addEventListener('click', onClick);
  return button;
}