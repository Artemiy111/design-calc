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
export const material_brands = ['<ничего>', '45', '50Г', '40Х', '40ХН', '20Х и 20ХФ', '12ХН3А', '18ХГТ', '20Х и 40Х', '30ХГТ', '40Х', '40ХФА', 'СЧ 30-52', 'ВЧ 30-2', '40ХЛ-40ГЛ', 'ПТ и ПТК', 'Б и В'] as const
export type Material_brand = typeof material_brands[number]

export const psi_bd_values = [0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6] as const
export type Psi_bd = typeof psi_bd_values[number]

export const heat_types = [
  'Улучшение',
  'Закалка ТВЧ поверхностная с охватом дна впадины',
  'Нормализация',
  'Закалка с высоким отпуском'
] as const
export type Heat_type = typeof heat_types[number]


export const material_with_brand_data: Record<Material, Record<Material_brand, Record<Heat_type, {
  HB: number,
  sigma_ap_HP: number,
  N_H_0: number
}>>> = {
  'сталь': {
    '45': {
      'Улучшение': {
        'HB': 250,
        'sigma_ap_HP': 600,
        'N_H_0': 1.5 * 10 ** 7
      },
      'Закалка ТВЧ поверхностная с охватом дна впадины': {
        'HB': 250,
        sigma_ap_HP: 800,
        'N_H_0': 6 * 10 ** 7
      },
    },
    '40Х': {
      'Нормализация': {
        'HB': 220,
        'sigma_ap_HP': 550,
        'N_H_0': 10 ** 7
      }
    },
  }
}

