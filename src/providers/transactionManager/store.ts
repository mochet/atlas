import { ExtrinsicStatus } from '@/joystream-lib'
import { createStore } from '@/store'

type ProcessedBlockAction = {
  targetBlock: number
  callback: () => void
}

export type TransactionDialogStep =
  | ExtrinsicStatus.ProcessingAssets
  | ExtrinsicStatus.Unsigned
  | ExtrinsicStatus.Signed
  | ExtrinsicStatus.Syncing
  | ExtrinsicStatus.Completed
  | ExtrinsicStatus.Error
  | null

type TransactionManagerStoreState = {
  blockActions: ProcessedBlockAction[]
  dialogStep: TransactionDialogStep
}

type TransactionManagerStoreActions = {
  addBlockAction: (action: ProcessedBlockAction) => void
  removeOldBlockActions: (currentBlock: number) => void
  setDialogStep: (step: TransactionDialogStep) => void
}

export const useTransactionManagerStore = createStore<TransactionManagerStoreState, TransactionManagerStoreActions>({
  state: { blockActions: [], dialogStep: null },
  actionsFactory: (set) => ({
    addBlockAction: (action) =>
      set((state) => {
        state.blockActions.push(action)
      }),
    removeOldBlockActions: (currentBlock) =>
      set((state) => {
        state.blockActions = state.blockActions.filter((action) => action.targetBlock > currentBlock)
      }),
    setDialogStep: (step) =>
      set((state) => {
        state.dialogStep = step
      }),
  }),
})
