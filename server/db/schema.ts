import { sqliteTable, int, real, text, blob } from 'drizzle-orm/sqlite-core'

export const assembly_name = 'Редуктор'
export const assembly_purpose = 'Специальное'

export const assemblies = sqliteTable('assemblies', {
  id: int('assembly_id').primaryKey(),
  name: text('assembly_name', { enum: [assembly_name] }).notNull(),
  purpose: text('assembly_purpose', { enum: [assembly_purpose] }).notNull(),
  d_w1_array: blob('{d_w1}', { mode: 'json' }).notNull(),
})

export const subassembly_name = 'Передача'
export const subassembly_type = 'Цилиндрическая'

export const load_kinds = ['Нереверсивная', 'Реверсивная'] as const
export const gear_locations = [
  'Симметричное расположение шестерни относительно опор',
  'Шестерня расположена несимметрично относительно опор',
  "Консольное расположение одного из колёс"
] as const

export const material_combinations = ['сталь - сталь'] as const

export const subassemblies = sqliteTable('subassemblies', {
  assembly_id: int('assembly_id').notNull().references(() => assemblies.id),

  id: int('subassembly_id').primaryKey(),
  name: text('subassembly_name', { enum: [subassembly_name] }).notNull(),
  type: text('subassembly_type', { enum: [subassembly_type] }).notNull(),

  u: int('u'), // Передаточное число
  K_Hbeta: real('К_ʜᵦ'), // Коэффициент, учитывающий распределение нагрузки по ширине венца при контакте
  N_H_0: real('N_ʜ₀'), // Базовое число циклов перемены напряжений, соответствующее длительному пределу выносливости
  N_Sum: real('N_Σ'), // Суммарное число циклов нагружения
  T_1: real('T₁'), // Крутящий момент на шестерне
  gear_location: text('gear_location', { enum: gear_locations }),
  load_type: text('load_type').notNull(), // Тип нагрузки
  load_kind: text('load_kind', { enum: load_kinds }).notNull(), // Вид нагрузки
  material_combination: text('material_combination', { enum: material_combinations }).notNull(), // Сочетание материалов колес
  assembly_rigidity: real('assembly_rigidity'), // Жесткость конструкции
})

export const detail_purposes = ['Ведущее', 'Ведомое'] as const

export const materials = ['Сталь'] as const
export const material_brand = ['20'] as const

export const details = sqliteTable('details', {
  subassembly_id: int('subassembly_id').notNull().references(() => subassemblies.id),

  id: int('detail_id').primaryKey(),
  name: text('detail_name').notNull(),
  type: text('detail_type').notNull(),
  purpose: text('detail_purpose', { enum: detail_purposes }).notNull(),

  K_d: real('K_d'), // Вспомогательный коэффициент
  material: text('material').notNull(),
  material_brand: text('material_brand').notNull(),
  heat_type: text('heat_type').notNull(), // Вид термообработки

  sigma_HP: real('σ_ʜᴘ'), // Допускаемое контактное напряжение
  sigma_ap_HP: real(`σ'_ʜᴘ`), // Допускаемое контактное напряжение, соответствующее базовому числу циклов перемены напряжений 
  psi_bd: real('ψ_bd'), // Относительная ширина венца
  K_HL: real('K_ʜʟ'), // Коэффициент долговечности
  N_HE: int('N_ʜᴇ'), // Эквивалентное число циклов перемены напряжений
  HB_or_HRC: int('HB или HRC'), // Твердость поверхности зубьев
  d_w1: real('d_w1'), // Диаметр 
})