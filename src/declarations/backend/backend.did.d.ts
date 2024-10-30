import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface LayoutItem {
  'top' : string,
  'content' : string,
  'left' : string,
  'type' : string,
}
export type Result = { 'ok' : string } |
  { 'err' : string };
export interface _SERVICE {
  'loadLayout' : ActorMethod<[], Array<LayoutItem>>,
  'saveLayout' : ActorMethod<[Array<LayoutItem>], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
