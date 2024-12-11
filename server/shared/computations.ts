import { table_6_5_data, type Detail_purpose, type Detail_type, type Gear_location, type Heat_type, type Load_type, type Material, type Material_brand, type Material_combination, type Psi_bd, type Shaft_rigidity } from './constants'

export function get_K_Hbeta_from_table_6_3(
  data: {
    psi_bd: Psi_bd,
    shaft_rigidity: Shaft_rigidity,
    material_combination: Material_combination,
    HB: number,
    detail_1: {
      gear_location: Gear_location,
    }
  }) {

  const { psi_bd, shaft_rigidity, material_combination, HB, detail_1 } = data
  const more350_1 = [1.00, 1.01, 1.03, 1.06, 1.10, 11.12, 1.15, 1.20]
  const less350_1 = [1.00, 1.00, 1.01, 1.03, 1.04, 1.05, 1.07, 1.08]
  const more350_2 = [1.01, 1.05, 1.09, 1.14, 1.18, 1.25, 1.32, 1.40]
  const less350_2 = [1.00, 1.02, 1.04, 1.06, 1.08, 1.10, 1.13, 1.16]
  const more350_3 = [1.06, 1.12, 1.20, 1.27, 1.37, 1.50, 1.60, null]
  const less350_3 = [1.02, 1.05, 1.08, 1.12, 1.15, 1.18, 1.23, 1.28]
  const more350_4 = [1.15, 1.35, 1.60, 1.85, null, null, null, null]
  const less350_4 = [1.07, 1.15, 1.24, 1.35, null, null, null, null]

  const materials = material_combination.split(' - ') as [Material, Material]
  const index = (psi_bd / 0.2) - 1

  if (materials.some(m => m === 'текстолит' || m === 'полиамид-капралон' || m === 'ДСП')) return 1

  switch (detail_1.gear_location) {
    case 'Симметричное расположение шестерни относительно опор': {
      return HB > 350 ? more350_1[index] : less350_1[index]
    }
    case 'Шестерня расположена несимметрично относительно опор': {
      switch (shaft_rigidity) {
        case 'весьма жёсткий вал': {
          return HB > 350 ? more350_2[index] : less350_2[index]
        }
        case 'менее жёсткий вал': {
          return HB > 350 ? more350_3[index] : less350_3[index]
        }
        case '<ничего>': throw new Error('Неправильно выбрано жёсткость вала')
      }
      shaft_rigidity satisfies never
      break
    }
    case 'Консольное расположение одного из колёс': {
      return HB > 350 ? more350_4[index] : less350_4[index]
    }
  }
  detail_1.gear_location satisfies never
}

export function get_K_d_from_table_6_4(
  data: {
    detail_type: Detail_type,
    material_combination: Material_combination
  }) {
  if (data.detail_type === 'Прямозубое') {
    switch (data.material_combination) {
      case 'сталь - сталь': return { K_d: 770 }
      case 'сталь - чугун': return { K_d: 700 }
      case 'сталь - бронза': return { K_d: 680 }
      case 'чугун - чугун': return { K_d: 645 }
      case 'текстолит - сталь': return { K_d: 310 }
      case 'ДСП - сталь': return { K_d: 360 }
      case 'полиамид-капралон - сталь': return { K_d: 240 }
    }
    data.material_combination satisfies never
  } else throw new Error('Неизвестный тип детали')
}

export function find_sigma_HP_of_detail(data: {
  t_hours: number,
  n: number,
  load_type: Load_type,
  detail: {
    detail_purpose: Detail_purpose,
    material: Material,
    material_brand: Material_brand,
    heat_type: Heat_type
  }
}) {
  const { t_hours, n, detail, load_type } = data
  const { sigma_ap_HP, N_H_0, HB } = get_data_from_table_6_5(detail)

  const { N_HE, N_Sum, K_HL } = find_K_HL({ t_hours, n, N_H_0, load_type, ...detail })

  const sigma_HP = sigma_ap_HP / K_HL

  return { sigma_ap_HP, N_H_0, N_HE, N_Sum, K_HL, sigma_HP, HB }
}

export function find_K_HL(data:
  {
    N_H_0: number,
    load_type: Load_type,
    t_hours: number,
    n: number
    material: Material,
    heat_type: Heat_type
  }) {
  const { N_H_0, load_type, t_hours, n, material, heat_type } = data
  const { N_HE, N_Sum } = compute_N_HE({ load_type, t_hours, n })
  let K_HL = Math.pow(N_H_0 / N_HE, 1 / 6)

  const is_volumetric_hardening = heat_type.includes('объёмное')
  const is_surface_hardening = heat_type.includes('поверхностное')

  if (material === 'сталь' && is_volumetric_hardening) K_HL = Math.min(K_HL, 2.6)
  else if (material === 'сталь' && is_surface_hardening) K_HL = Math.min(K_HL, 1.8)
  else if (material === 'чугун') K_HL = Math.max(1, Math.min(K_HL, 1.4))
  else if (material === 'текстолит' || material === 'полиамид-капралон') K_HL = 1
  else if (N_HE / N_H_0 > 1) K_HL = 1

  return { N_HE, N_Sum, K_HL }
}

export function compute_N_HE(data: { load_type: Load_type, t_hours: number, n: number }) {
  const { load_type, t_hours, n } = data
  switch (load_type) {
    case 'Постоянная': {
      const N_Sum = 60 * t_hours * n
      const N_HE = N_Sum

      return {
        N_HE,
        N_Sum
      }
    }
    case 'Ступенчатая': {
      throw new Error('Не реализовано')
    }
  }
  load_type satisfies never
}

export function get_data_from_table_6_5(data: {
  material: Material,
  material_brand: Material_brand,
  heat_type: Heat_type
  // load_kind: Load_kind
}) {
  const res = table_6_5_data.find(t => t.material === data.material && t.material_brand === data.material_brand && t.heat_type === data.heat_type)
  if (res === undefined) throw new Error('Не найдено значение для материала, марка и термообработки')
  const { N_H_0 } = res
  if (N_H_0 === null) throw new Error('Не значения N_H_0')
  return { ...res, N_H_0 }
}

export function execute(data: {
  material_combination: Material_combination,
  shaft_rigidity: Shaft_rigidity,
  t_hours: number,
  n: number,
  u: number
  load_type: Load_type
  detail_1: {
    detail_type: Detail_type,
    detail_purpose: Extract<Detail_purpose, 'Ведущее'>
    material: Material,
    material_brand: Material_brand,
    heat_type: Heat_type,
    psi_bd: Psi_bd,
    T: number,
    gear_location: Gear_location,
  }
  detail_2: {
    detail_type: Detail_type,
    detail_purpose: Extract<Detail_purpose, 'Ведомое'>
    material: Material,
    material_brand: Material_brand,
    heat_type: Heat_type,
  }
}) {
  const { u, detail_1, detail_2 } = data
  const T_1 = data.detail_1.T
  if (data.material_combination !== `${detail_1.material} - ${detail_2.material}`)
    throw new Error('Неправильно выбраны материалы деталей')

  const K_Hbeta = get_K_Hbeta_from_table_6_3({ ...data, HB: 349, psi_bd: detail_1.psi_bd })
  if (K_Hbeta === null) throw new Error('Неправильно выбрано K_Hbeta')

  const { K_d } = get_K_d_from_table_6_4({ material_combination: data.material_combination, detail_type: detail_1.detail_type })
  const detail_1_res = find_sigma_HP_of_detail({ ...data, detail: detail_1 })
  const detail_2_res = find_sigma_HP_of_detail({ ...data, detail: detail_2 })

  const sigma_HP = Math.min(detail_1_res.sigma_HP, detail_2_res.sigma_HP)

  const d_w1 = K_d * Math.pow((T_1 * K_Hbeta * (u + 1) / (u * detail_1.psi_bd * sigma_HP ** 2)), 1 / 3)
  return { detail_1: { ...detail_1_res, d_w1 }, detail_2: detail_2_res, K_d, K_Hbeta, sigma_HP }
}
