export const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'

export const CHART_LIBRARY_PATH = '/vendor/charting_library/charting_library/'

export enum ProjectId {
  NULL_PROJECT = 0,
  GAINS = 3, // GTrade
  MUX_V3 = 6, // MUX V3 (default)
  FOUR_MEME = 7, // Four.meme
}

// Oracle Display Names
export const ORACLE_NAMES: Record<ProjectId, string> = {
  [ProjectId.NULL_PROJECT]: 'Unknown',
  [ProjectId.GAINS]: 'gTrade',
  [ProjectId.MUX_V3]: 'Aster',
  [ProjectId.FOUR_MEME]: 'Four.meme',
}
