import type { Table_6_5_new } from '../db/schema'

export const assembly_name = 'Редуктор' as const
export const assembly_purpose = 'Специальное' as const

export const subassembly_name = 'Передача' as const
export const subassembly_type = 'Цилиндрическая' as const

export const load_kinds = ['Нереверсивная', 'Реверсивная'] as const
export type Load_kind = typeof load_kinds[number]

export const load_types = ['Постоянная', 'Ступенчатая'] as const
export type Load_type = typeof load_types[number]

export const gear_locations = [
  'Симметричное расположение шестерни относительно опор',
  'Шестерня расположена несимметрично относительно опор',
  "Консольное расположение одного из колёс"
] as const
export type Gear_location = typeof gear_locations[number]

export const material_combinations = [
  'сталь - сталь',
  'сталь - бронза',
  'сталь - чугун',
  'чугун - чугун',
  'текстолит - сталь',
  'ДСП - сталь',
  'полиамид-капралон - сталь',
] as const
export type Material_combination = typeof material_combinations[number]

export const shaft_rigidities = ['<ничего>', 'весьма жёсткий вал', 'менее жёсткий вал'] as const
export type Shaft_rigidity = typeof shaft_rigidities[number]

export const detail_name = 'Зубчатое колесо' as const
export type Detail_name = typeof detail_name
export const detail_type = 'Прямозубое' as const
export type Detail_type = typeof detail_type
export const detail_purposes = ['Ведущее', 'Ведомое'] as const
export type Detail_purpose = typeof detail_purposes[number]

export const materials = ['сталь', 'чугун', 'текстолит', 'ДСП', 'полиамид-капралон'] as const
export type Material = typeof materials[number]
export const material_brands = [
  '<ничего>',
  '45', '50Г', '40Х', '40ХН', '20Х и 20ХФ', '12ХН3А', '18ХГТ', '20Х и 40Х', '30ХГТ', '40Х', '40ХФА',
  'СЧ 30-52', 'ВЧ 30-2',
  '40ХЛ-40ГЛ',
  'ПТ', 'ПТК',
  'Б', 'В'
] as const
export type Material_brand = typeof material_brands[number]

export const psi_bd_values = [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6] as const
export type Psi_bd = typeof psi_bd_values[number]

export const heat_types = [
  '<ничего>',
  'Улучшение',
  'Закалка ТВЧ поверхностная с охватом дна впадины',
  'Нормализация',
  'Закалка с высоким отпуском'
] as const
export type Heat_type = typeof heat_types[number]

export const table_6_5_data: Table_6_5_new[] = [
  {
    material: 'сталь',
    material_brand: '45',
    heat_type: 'Улучшение',
    HB: 260,
    sigma_ap_HP: 600,
    N_H_0: 1.5 * 10 ** 7
  },
  {
    material: 'сталь',
    material_brand: '45',
    heat_type: 'Закалка ТВЧ поверхностная с охватом дна впадины',
    HB: 260,
    sigma_ap_HP: 800,
    N_H_0: 6 * 10 ** 7
  },
  {
    material: 'сталь',
    material_brand: '40Х',
    heat_type: 'Нормализация',
    HB: 220,
    sigma_ap_HP: 550,
    N_H_0: 10 ** 7
  },
  {
    material: 'сталь',
    material_brand: '40Х',
    heat_type: 'Улучшение',
    HB: 260,
    sigma_ap_HP: 650,
    N_H_0: 2.5 * 10 ** 7
  },
  {
    material: 'сталь',
    material_brand: '40Х',
    heat_type: 'Закалка ТВЧ поверхностная с охватом дна впадины',
    HB: 265,
    sigma_ap_HP: 900,
    N_H_0: 8 * 10 ** 7
  },
  {
    material: 'сталь',
    material_brand: '40ХН',
    heat_type: 'Закалка ТВЧ поверхностная с охватом дна впадины',
    HB: 280,
    sigma_ap_HP: 1000,
    N_H_0: 10 ** 7
  },
  {
    material: 'чугун',
    material_brand: 'СЧ 30-52',
    heat_type: '<ничего>',
    HB: 255,
    sigma_ap_HP: 550,
    N_H_0: 10 ** 7
  },
  {
    material: 'чугун',
    material_brand: 'ВЧ 30-2',
    heat_type: '<ничего>',
    HB: 265,
    sigma_ap_HP: 600,
    N_H_0: 10 ** 7
  },
  {
    material: 'сталь',
    material_brand: '40ХЛ-40ГЛ',
    heat_type: 'Закалка с высоким отпуском',
    HB: 255,
    sigma_ap_HP: 600,
    N_H_0: 10 ** 7
  },
  {
    material: 'текстолит',
    material_brand: 'ПТ',
    heat_type: '<ничего>',
    HB: 35,
    sigma_ap_HP: 55,
    N_H_0: null
  },
  {
    material: 'текстолит',
    material_brand: 'ПТК',
    heat_type: '<ничего>',
    HB: 35,
    sigma_ap_HP: 55,
    N_H_0: null
  },
  {
    material: 'ДСП',
    material_brand: 'Б',
    heat_type: '<ничего>',
    HB: 50,
    sigma_ap_HP: 60,
    N_H_0: null
  },
  {
    material: 'ДСП',
    material_brand: 'В',
    heat_type: '<ничего>',
    HB: 50,
    sigma_ap_HP: 60,
    N_H_0: null
  },
]

