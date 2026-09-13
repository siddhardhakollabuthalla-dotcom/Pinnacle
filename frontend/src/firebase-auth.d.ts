declare module 'firebase/auth' {
  export function getAuth(app?: any): any;
  export class GoogleAuthProvider {
    constructor();
  }
  export function signInWithPopup(auth: any, provider: any): Promise<any>;
}
