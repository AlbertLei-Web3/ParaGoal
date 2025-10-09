// contractsCompat.js — pallet-contracts 兼容工具
// Chinese: 适配不同版本的 pallet-contracts（旧版使用 legacy Weight，新版使用 WeightV2），
//          统一返回正确的 gasLimit 类型，避免在旧链上因 WeightV2 不兼容导致调用失败。
// English: Compatibility helpers for different pallet-contracts versions (legacy Weight vs WeightV2),
//          returning the proper gasLimit type so calls work on old runtimes like POP.

/**
 * 检测是否支持 pallet-contracts
 * English: Detect pallet-contracts availability on runtime
 */
export function hasContractsPallet(api) {
  return !!(api?.tx && api.tx.contracts && api?.query && api.query.contracts)
}

/**
 * 检测是否支持 WeightV2（新版 runtime）
 * English: Detect if WeightV2 exists (newer runtime)
 */
export function supportsWeightV2(api) {
  // 策略：尝试创建 WeightV2；失败则视为不支持
  // English: Try to create WeightV2; if throws, it's not supported
  try {
    api.registry.createType('WeightV2', { refTime: 1, proofSize: 1 })
    return true
  } catch {
    return false
  }
}

/**
 * 生成 gasLimit（根据 runtime 选择 WeightV2 或 legacy Weight）
 * English: Build gasLimit using WeightV2 or legacy Weight depending on runtime
 *
 * @param {ApiPromise} api
 * @param {object} opts { refTime: number, proofSize: number, legacyWeight?: number }
 *  - 对于新版：使用 refTime/proofSize
 *  - 对于旧版：使用 legacyWeight（默认给一个较大的上限值）
 */
export function makeGasLimit(api, opts = {}) {
  const { refTime = 2_000_000_000, proofSize = 200_000, legacyWeight } = opts
  if (supportsWeightV2(api)) {
    return api.registry.createType('WeightV2', { refTime, proofSize })
  }
  // 旧版 runtime 使用 u64 Weight，上限值可根据需要调整
  const weight = legacyWeight != null ? legacyWeight : 5_000_000_000
  return api.registry.createType('Weight', weight)
}

/**
 * 在合约对象上选择消息名（snake_case 或 camelCase）
 * English: Pick message by snake_case or camelCase name from contract.query/tx
 */
export function pickMessage(container, snakeName, camelName) {
  if (!container) return null
  return container[snakeName] || container[camelName] || null
}


