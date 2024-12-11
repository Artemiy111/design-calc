import { int, primaryKey, real, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { createInsertSchema } from 'drizzle-zod'

import type { Psi_bd } from '../shared/constants'

import { assembly_name, assembly_purpose, detail_name, detail_purposes, detail_type, gear_locations, heat_types, load_kinds, load_types, material_brands, material_combinations, materials, shaft_rigidities, subassembly_name, subassembly_type, table_6_5_data } from '../shared/constants'

export const assemblies = sqliteTable('assemblies', {
  id: int('assembly_id').primaryKey(),
  name: text('assembly_name', { enum: [assembly_name] }).notNull(),
  purpose: text('assembly_purpose', { enum: [assembly_purpose] }).notNull(),
}, () => [])

export const createAssemblySchema = createInsertSchema(assemblies)

export const subassemblies = sqliteTable('subassemblies', {
  assembly_id: int('assembly_id').notNull().references(() => assemblies.id),

  id: int('subassembly_id').primaryKey(),
  name: text('subassembly_name', { enum: [subassembly_name] }).notNull(),
  type: text('subassembly_type', { enum: [subassembly_type] }).notNull(),

  u: int('u').notNull(), // Передаточное число
  K_Hbeta: real('К_ʜᵦ'), // Коэффициент, учитывающий распределение нагрузки по ширине венца при контакте
  load_type: text('load_type', { enum: load_types }).notNull(), // Тип нагрузки
  K_d: real('K_d').notNull(), // Вспомогательный коэффициент
  material_combination: text('material_combination', { enum: material_combinations }).notNull(), // Сочетание материалов колес
  shaft_rigidity: text('shaft_rigidity', { enum: shaft_rigidities }).notNull(), // Жесткость вала
  sigma_HP: real('σ_ʜᴘ').notNull(),
}, () => [])

export const createSubassemblySchema = createInsertSchema(subassemblies)

export const details = sqliteTable('details', {
  subassembly_id: int('subassembly_id').notNull().references(() => subassemblies.id),

  id: int('detail_id').primaryKey(),
  name: text('detail_name', { enum: [detail_name] }).notNull(),
  type: text('detail_type', { enum: [detail_type] }).notNull(),
  purpose: text('detail_purpose', { enum: detail_purposes }).notNull(),

  material: text('material', { enum: materials }).notNull(),
  material_brand: text('material_brand', { enum: material_brands }).notNull(),
  heat_type: text('heat_type', { enum: heat_types }).notNull(), // Вид термообработки
  T: real('T'), // Крутящий момент
  gear_location: text('gear_location', { enum: gear_locations }),
  psi_bd: real('ψ_bd').$type<Psi_bd>(), // Относительная ширина венца

  sigma_HP: real('σ_ʜᴘ').notNull(), // Допускаемое контактное напряжение
  sigma_ap_HP: real(`σ'_ʜᴘ`).notNull(), // Допускаемое контактное напряжение, соответствующее базовому числу циклов перемены напряжений 
  K_HL: real('K_ʜʟ').notNull(), // Коэффициент долговечности
  N_HE: int('N_ʜᴇ').notNull(), // Эквивалентное число циклов перемены напряжений
  N_H_0: int('N_ʜ₀').notNull(), // Базовое число циклов перемены напряжений, соответствующее длительному пределу выносливости,
  N_Sum: real('N_Σ').notNull(), // Суммарное число циклов нагружения
  HB: int('HB').notNull(), // Твердость поверхности зубьев
  d_w1: real('d_w1'), // Диаметр 
}, () => [])

export const createDetailSchema = createInsertSchema(details)

export const table_6_3 = sqliteTable('table_6_3', {
  psi_bd: real('ψ_bd').notNull(),
  gear_location: text('gear_location', { enum: gear_locations }).notNull(),
  shaft_rigidity: text('shaft_rigidity', { enum: shaft_rigidities }),
  HB_match: text('HB_match', { enum: ['>350', '<350'] }),
  K_Hbeta: real('К_ʜᵦ').notNull(),
}, (t) => [primaryKey({ columns: [t.psi_bd, t.gear_location, t.shaft_rigidity, t.HB_match] })])

export const table_6_4 = sqliteTable('table_6_4', {
  detail_type: text('detail_type', { enum: [detail_type] }).notNull(),
  material_combination: text('material_combination', { enum: material_combinations }).notNull(),
  K_d: real('K_d').notNull(),
}, (t) => [primaryKey({ columns: [t.detail_type, t.material_combination] })])

export type Table_6_4_new = Omit<typeof table_6_4.$inferSelect, 'id'>

export const table_6_5 = sqliteTable('table_6_5', {
  material: text('material', { enum: materials }).notNull(),
  material_brand: text('material_brand', { enum: material_brands }).notNull(),
  heat_type: text('heat_type', { enum: heat_types }).notNull(),
  HB: int('HB').notNull(),
  sigma_ap_HP: real(`σ'_ʜᴘ`).notNull(),
  N_H_0: real('N_ʜ₀'),
}, (t) => [primaryKey({ columns: [t.material, t.material_brand, t.heat_type] })])

export type Table_6_5_new = Omit<typeof table_6_5.$inferSelect, 'id'>
