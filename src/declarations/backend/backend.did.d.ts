import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface LayoutItem {
  'top' : string,
  'height' : string,
  'styles' : {
    'backgroundColor' : string,
    'borderRadius' : string,
    'borderStyle' : string,
    'color' : string,
    'borderWidth' : string,
    'boxShadow' : string,
    'fontSize' : string,
    'borderColor' : string,
  },
  'content' : string,
  'left' : string,
  'type' : string,
  'width' : string,
}
export type Result = { 'ok' : string } |
  { 'err' : string };
export interface _SERVICE {
  'loadLayout' : ActorMethod<[], Array<LayoutItem>>,
  'saveLayout' : ActorMethod<[Array<LayoutItem>], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
