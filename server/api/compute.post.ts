import type { H3Error } from 'h3'

import type { Psi_bd } from './../shared/constants'

import { db } from '../db'
import { assemblies, details, subassemblies } from '../db/schema'
import { execute } from '../shared/computations'
import { schema } from '../shared/validators'
import { assembly_name, assembly_purpose, detail_name, subassembly_name, subassembly_type } from './../shared/constants'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, schema.parse)

  let res: ReturnType<typeof execute> = null!
  try {
    res = execute({ ...body, detail_1: { ...body.detail_1, psi_bd: parseFloat(body.detail_1.psi_bd) as Psi_bd } })

  } catch (_e) {
    const e = _e as Error
    throw createError({ statusCode: 400, statusMessage: e.message })
  }

  console.log('computed')

  await db.transaction(async (tx) => {
    const assembly = (await tx.insert(assemblies).values({
      name: assembly_name,
      purpose: assembly_purpose,
    }).returning())[0]

    const subassembly = (await tx.insert(subassemblies).values({
      assembly_id: assembly.id,
      name: subassembly_name,
      type: subassembly_type,
      u: body.u,
      shaft_rigidity: body.shaft_rigidity,
      load_type: body.load_type,
      material_combination: body.material_combination,

      K_d: res.K_d,
      K_Hbeta: res.K_Hbeta,
      sigma_HP: res.sigma_HP,
    }).returning())[0]


    const detail_1 = await tx.insert(details).values({
      subassembly_id: subassembly.id,
      name: detail_name,
      type: body.detail_1.detail_type,
      purpose: body.detail_1.detail_purpose,
      material: body.detail_1.material,
      material_brand: body.detail_1.material_brand,
      heat_type: body.detail_1.heat_type,
      T: body.detail_1.T,
      gear_location: body.detail_1.gear_location,
      psi_bd: (parseFloat(body.detail_1.psi_bd) as Psi_bd),

      HB: res.detail_1.HB,
      sigma_HP: res.detail_1.sigma_HP,
      sigma_ap_HP: res.detail_1.sigma_ap_HP,
      K_HL: res.detail_1.K_HL,
      N_HE: res.detail_1.N_HE,
      N_H_0: res.detail_1.N_H_0,
      N_Sum: res.detail_1.N_Sum,
      d_w1: res.detail_1.d_w1,
    })

    const detail_2 = (await tx.insert(details).values({
      subassembly_id: subassembly.id,
      name: detail_name,
      type: body.detail_2.detail_type,
      purpose: body.detail_2.detail_purpose,
      material: body.detail_2.material,
      material_brand: body.detail_2.material_brand,
      heat_type: body.detail_2.heat_type,

      HB: res.detail_2.HB,
      sigma_HP: res.detail_2.sigma_HP,
      sigma_ap_HP: res.detail_2.sigma_ap_HP,
      K_HL: res.detail_2.K_HL,
      N_HE: res.detail_2.N_HE,
      N_H_0: res.detail_2.N_H_0,
      N_Sum: res.detail_2.N_Sum,
    }).returning())[0]
  })
  return res
})