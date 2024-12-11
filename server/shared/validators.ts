import { z } from 'zod'

import { detail_purposes, detail_type, gear_locations, heat_types, load_types, material_brands, material_combinations, materials, psi_bd_values, shaft_rigidities } from './constants'

export const psi_bd_values_strings = psi_bd_values.map(String) as [
  '0.2',
  '0.4',
  '0.6',
  '0.8',
  '1.0',
  '1.2',
  '1.4',
  '1.6',
]

export const schema = z.object({
  u: z.number(),
  shaft_rigidity: z.enum(shaft_rigidities),
  load_type: z.enum([load_types[0]]),
  n: z.number(),
  t_hours: z.number(),
  material_combination: z.enum(material_combinations),
  detail_1: z.object({
    detail_type: z.enum([detail_type]),
    detail_purpose: z.enum([detail_purposes[0]]),
    material: z.enum(materials),
    material_brand: z.enum(material_brands),
    heat_type: z.enum(heat_types),
    psi_bd: z.enum(psi_bd_values_strings),
    T: z.number(),
    gear_location: z.enum(gear_locations),
  }),
  detail_2: z.object({
    detail_type: z.enum([detail_type]),
    detail_purpose: z.enum([detail_purposes[1]]),
    material: z.enum(materials),
    material_brand: z.enum(material_brands),
    heat_type: z.enum(heat_types),
  }),
  results: z.object({
    detail_1: z.object({
      HB: z.number().optional(),
      N_H_0: z.number().optional(),
      N_Sum: z.number().optional(),
      N_HE: z.number().optional(),
      K_HL: z.number().optional(),
      sigma_ap_HP: z.number().optional(),
      sigma_HP: z.number().optional(),
      d_w1: z.number().optional(),
    }),
    detail_2: z.object({
      HB: z.number().optional(),
      N_H_0: z.number().optional(),
      N_Sum: z.number().optional(),
      N_HE: z.number().optional(),
      K_HL: z.number().optional(),
      sigma_ap_HP: z.number().optional(),
      sigma_HP: z.number().optional(),
    }),
    K_d: z.number().optional(),
    K_Hbeta: z.number().optional(),
    sigma_HP: z.number().optional(),
  }),
})
export type Schema = z.output<typeof schema>