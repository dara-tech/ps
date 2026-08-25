declare module 'react-dom' {
  export function createPortal(children: any, container: any, key?: any): any;
  export function render(element: any, container: any, callback?: any): any;
  export function unmountComponentAtNode(container: any): boolean;
  export function findDOMNode(instance: any): any;
  export const version: string;
}

declare module 'react-dom/client' {
  export function createRoot(container: any, options?: any): any;
  export function hydrateRoot(container: any, children: any, options?: any): any;
}
