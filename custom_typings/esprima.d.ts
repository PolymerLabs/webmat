import * as esprima from 'esprima';

declare module 'esprima' {
  export interface ESLocation {
    line: number;
    column: number;
  }

  export interface Token { loc?: {start: ESLocation; end: ESLocation;} }
}
