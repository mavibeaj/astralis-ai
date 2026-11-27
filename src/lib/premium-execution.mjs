import {narrativeRequest,validateNarrative} from './premium-narrative.mjs';
export const DEFAULT_BUDGET_MICRO_USD=100000;
function safeInt(n){return Number.isSafeInteger(n)&&n>=0}
export function estimateCostMicroUsd(inputTokens,outputTokens,pricing){
 if(![inputTokens,outputTokens,pricing?.inputMicroUsdPerMillion,pricing?.outputMicroUsdPerMillion].every(safeInt))throw new RangeError('Invalid pricing or usage');
 const amount=(BigInt(inputTokens)*BigInt(pricing.inputMicroUsdPerMillion)+BigInt(outputTokens)*BigInt(pricing.outputMicroUsdPerMillion)+999999n)/1000000n;
 if(amount>BigInt(Number.MAX_SAFE_INTEGER))throw new RangeError('Cost overflow');
 return Number(amount);
}
// Simulation only. A real server must verify payment, trusted input, provider pricing,
// all billable token categories and enforce provider-level spending limits.
export async function simulatePremiumExecution({result,locale,relationship,adapter,pricing,inputTokenLimit=4000,budgetMicroUsd=DEFAULT_BUDGET_MICRO_USD}){
 const request=narrativeRequest(result,locale,relationship);
 if(adapter?.kind!=='mock'||typeof adapter.generate!=='function')throw new RangeError('Only mock adapters are enabled');
 if(!safeInt(inputTokenLimit)||inputTokenLimit===0||!safeInt(budgetMicroUsd)||budgetMicroUsd===0)throw new RangeError('Invalid budget');
 const projected=estimateCostMicroUsd(inputTokenLimit,request.maxOutputTokens,pricing);
 if(projected>budgetMicroUsd)throw new RangeError('Projected cost exceeds budget');
 const response=await adapter.generate({...request,inputTokenLimit});
 const usage=response?.usage;
 if(!safeInt(usage?.inputTokens)||!safeInt(usage?.outputTokens)||usage.inputTokens>inputTokenLimit||usage.outputTokens>request.maxOutputTokens)throw new RangeError('Unexpected usage');
 const simulatedCostMicroUsd=estimateCostMicroUsd(usage.inputTokens,usage.outputTokens,pricing);
 if(simulatedCostMicroUsd>budgetMicroUsd)throw new RangeError('Cost exceeds budget');
 return {kind:'simulation',report:validateNarrative(response.text,result,locale,relationship),simulatedCostMicroUsd,actualChargeMicroUsd:0};
}
