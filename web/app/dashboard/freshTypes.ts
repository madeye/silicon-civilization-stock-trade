import type { compareNewWindow } from "@/lib/freshValidation";

export interface FreshValidationReport {
  generatedAt: string;
  profile: string;
  source: string;
  fetchedAt: string;
  newDataStart: string;
  newDataEnd: string;
  quality: {symbols:number;stale:Array<{symbol:string;lastDate:string}>};
  continuous: ReturnType<typeof compareNewWindow> & {trades:unknown[]};
  cashStart: ReturnType<typeof compareNewWindow> & {trades:unknown[]};
  historicalRestatement: {through:string;oldEquity:number;newEquity:number};
}
