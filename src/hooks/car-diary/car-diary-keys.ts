export const carDiaryKeys = {
  all: ['car-diary'] as const,
  state: (userId: string) => [...carDiaryKeys.all, 'state', userId] as const,
}
