<script setup lang="ts">
import { z } from 'zod'
import katex from 'katex'
import type { FormSubmitEvent } from '#ui/types'

import {
  detail_purposes,
  detail_type,
  gear_locations,
  heat_types,
  load_types,
  material_brands,
  material_combinations,
  materials,
  psi_bd_values,
  shaft_rigidities,
  type Psi_bd,
} from '~~/server/shared/constants'
import { execute } from '~~/server/shared/computations'

const toast = useToast()

const psi_bd_values_strings = psi_bd_values.map(String) as ['0.2', '0.4', '0.6', '0.8', '1.0', '1.2', '1.4', '1.6']
const schema = z.object({
  u: z.number(),
  gear_location: z.enum(gear_locations),
  shaft_rigidity: z.enum(shaft_rigidities),
  load_type: z.enum([load_types[0]]),
  T_1: z.number(),
  n: z.number(),
  t_hours: z.number(),
  material_combination: z.enum(material_combinations),
  detail_1: z.object({
    detail_type: z.enum([detail_type]),
    detail_purpose: z.enum([detail_purposes[0]]),
    material: z.enum(materials),
    material_brand: z.enum(material_brands),
    heat_type: z.enum(heat_types),
    load_type: z.enum(load_types),
    psi_bd: z.enum(psi_bd_values_strings),
  }),
  detail_2: z.object({
    detail_type: z.enum([detail_type]),
    detail_purpose: z.enum([detail_purposes[1]]),
    material: z.enum(materials),
    material_brand: z.enum(material_brands),
    heat_type: z.enum(heat_types),
    load_type: z.enum(load_types)
  }),
  results: z.object({
    detail_1: z.object({
      K_HL: z.number().optional(),
      sigma_ap_HP: z.number().optional(),
      sigma_HP: z.number().optional(),
    }),
    detail_2: z.object({
      K_HL: z.number().optional(),
      sigma_ap_HP: z.number().optional(),
      sigma_HP: z.number().optional(),
    }),
    K_d: z.number().optional(),
    K_Hbeta: z.number().optional(),
    sigma_HP: z.number().optional(),
    d_w1: z.number().optional(),
  })
})
type Schema = z.output<typeof schema>

const state = ref<Schema>({
  u: 1,
  gear_location: 'Симметричное расположение шестерни относительно опор',
  shaft_rigidity: '<ничего>',
  load_type: 'Постоянная',
  T_1: 100,
  n: 100,
  t_hours: 1000,
  material_combination: 'сталь - сталь',
  detail_1: {
    detail_type: 'Прямозубое',
    detail_purpose: 'Ведущее',
    material: 'сталь',
    material_brand: '45',
    heat_type: 'Улучшение',
    load_type: "Постоянная",
    psi_bd: '0.2'
  },
  detail_2: {
    detail_type: 'Прямозубое',
    detail_purpose: 'Ведомое',
    material: 'сталь',
    material_brand: '45',
    heat_type: 'Улучшение',
    load_type: "Постоянная",
  },
  results: {
    detail_1: {},
    detail_2: {},
  }
})

const dw_1_formula = katex.renderToString(`d_{w1} = K_d \\ \\sqrt[3]{\\dfrac{T_1 K_{H\\beta} (u \\pm 1)}{u \\psi_{bd} \\sigma^2_{H P}}}`)
const K_HL_formula = katex.renderToString(`K_{HL} = \\sqrt[6]{N_{H_0} / N_{HE}}`)
const sigma_HP_formula = katex.renderToString(`\\sigma_{HP} = \\sigma'_{HP} / K_{HL}`)
const sigma_HP_result_formula = katex.renderToString(`\\sigma_{HP} = min(\\sigma_{HP_1}, \\sigma_{HP_2})`)

const onSubmit = (e: FormSubmitEvent<Schema>) => {
  const data = e.data
  console.log(data)
  try {
    const res = execute({...data, detail_1 : {...data.detail_1, psi_bd: parseFloat(e.data.detail_1.psi_bd) as Psi_bd}}) 
    console.log(res)
    state.value.results = res
  } catch(_e) {
    const e = _e as Error
    toast.add({'title': e.message, color: 'error'})
  }

}
</script>

<template>
  <UApp>
    <main class="container mx-auto mt-8">
      <h1 class="text-2xl font-bold">
        Проектировочный расчет цилиндрической передачи с прямым зубом (ЦПсПз) для коробок передач и
        специальных редукторов
      </h1>

      <UForm 
      :schema="schema"
       :state="state" 
       class="grid grid-cols-[max-content_max-content_max-content] gap-x-16 gap-y-12 mt-8" 
      @submit="onSubmit"> 
        <section class="flex flex-col w-110 gap-4">
          <h2 class="text-xl font-bold w-full">Параметры Сборочной единицы</h2>
          <UFormField name="u" label="Номер передачи" hint="u">
            <UInputNumber class="w-full" :min="1" :max="10" v-model="state.u" />
          </UFormField>
          <UFormField name="gear_location" label="Расположение шестерни" hint="gear_location" ">
            <USelect  class="w-full" v-model="state.gear_location" :items="gear_locations" />
          </UFormField>
          <UFormField name="shaft_rigidity" label="Жёсткость вала" hint="shaft_rigidity" >
            <USelect class="w-full" v-model="state.shaft_rigidity" :items="shaft_rigidities" />
          </UFormField>
          <UFormField name="load_type" label="Тип нагрузки" hint="load_type" >
            <USelect class="w-full" :items="load_types" v-model="state.load_type" disabled  />
          </UFormField>
          <UFormField name="T_1" label="Крутящий момент на шестерне" hint="T₁">
            <UInputNumber class="w-full" :min="1" :max="100000" v-model="state.T_1" />
          </UFormField>
          <UFormField name="n" label="Частота вращения" hint="n">
            <UInputNumber class="w-full" :min="1" :max="100000" v-model="state.n" />
          </UFormField>
          <UFormField name="t_hours" label="Полное число часов работы передачи за срок службы" hint="t_ч">
            <UInputNumber class="w-full" :min="100" :max="100000" v-model="state.t_hours" />
          </UFormField>
          <UFormField name="material_combination" label="Комбинация материалов зубатых колёс" hint="material_combination" >
            <USelect class="w-full" :items="material_combinations" v-model="state.material_combination"  />
          </UFormField>
        </section>
        <section class="flex flex-col w-110 gap-4">
          <h2 class="text-xl font-bold">Параметры шестерни</h2>
          <UFormField name="detail_1.detail_type" label="Тип зубчатого колеса" hint="detail_type">
            <UInput class="w-full" v-model="state.detail_1.detail_type" disabled />
          </UFormField>
          <UFormField name="detail_1.detail_purpose" label="Назначение зубчатого колеса" hint="detail_purpose">
            <UInput class="w-full" v-model="state.detail_1.detail_purpose" disabled />
          </UFormField>
          <UFormField name="detail_1.material" label="Материал" hint="material">
            <USelect class="w-full" :items="materials" v-model="state.detail_1.material" />
          </UFormField>
          <UFormField name="detail_1.material_brand" label="Марка материала" hint="material_brand" >
            <USelect class="w-full" :items="material_brands" v-model="state.detail_1.material_brand" />
          </UFormField>
          <UFormField name="detail_1.heat_type" label="Термообработка" hint="heat_type">
            <USelect class="w-full" :items="heat_types" v-model="state.detail_1.heat_type" />
          </UFormField>
          <UFormField name="detail_1.psi_bd" label="Относительная ширина венца" hint="ψ_bd">
            <USelect class="w-full" :items="psi_bd_values_strings" v-model="state.detail_1.psi_bd" />
          </UFormField>
          <UFormField name="results.K_HL" label="Коэффициент долговечности" hint="K_ʜʟ">
            <div class="mb-2" v-html="K_HL_formula" />
            <UInput variant="soft" class="w-full" v-model="state.results.detail_1.K_HL" disabled />
          </UFormField>
          <UFormField name="results.detail_1.sigma_HP" label="Допускаемое контактное напряжение" hint="σ_ʜᴘ">
            <div class="mb-2" v-html="sigma_HP_formula" />
            <UInput variant="soft" class="w-full" v-model="state.results.detail_1.sigma_HP" disabled />
          </UFormField>
        </section>
        <section class="flex flex-col gap-4">
          <h2 class="text-xl font-bold">Параметры ведомого зубчатого колеса</h2>
          <UFormField name="detail_1.detail_type" label="Тип зубчатого колеса" hint="detail_type">
            <UInput class="w-full" v-model="state.detail_1.detail_type" disabled />
          </UFormField>
          <UFormField name="detail_2.detail_purpose" label="Назначение зубчатого колеса" hint="detail_purpose">
            <UInput class="w-full" v-model="state.detail_2.detail_purpose" disabled />
          </UFormField>
          <UFormField name="detail_2.material" label="Материал" hint="material">
            <USelect class="w-full" :items="materials" v-model="state.detail_2.material" />
          </UFormField>
          <UFormField name="detail_2.material_brand" label="Марка материала" hint="material_brand" >
            <USelect class="w-full" :items="material_brands" v-model="state.detail_2.material_brand" />
          </UFormField>
          <UFormField name="detail_2.heat_type" label="Термообработка" hint="heat_type">
            <USelect class="w-full" :items="heat_types" v-model="state.detail_2.heat_type" />
          </UFormField>
          <UFormField name="results.K_HL" label="Коэффициент долговечности" hint="K_ʜʟ">
            <UInput variant="soft" class="w-full" v-model="state.results.detail_1.K_HL" disabled />
          </UFormField>
          <UFormField name="results.detail_2.sigma_HP" label="Допускаемое контактное напряжение" hint="σ_ʜᴘ">
            <UInput variant="soft" class="w-full" v-model="state.results.detail_2.sigma_ap_HP" disabled />
          </UFormField>
        </section>
        <section class="flex flex-col gap-4">
          <UButton type="submit">Вычислить</UButton>
          <h3 class="text-xl font-bold">Результаты</h3>
          <UFormField name="results.K_d" label="Вспомогательный коэффициент" hint="К_d"> 
            <UInput variant="soft" class="w-full" v-model="state.results.K_d" disabled />
          </UFormField>
          <UFormField name="results.K_Hbeta" label="Коэффициент, учитывающий распределение нагрузки по ширине венца при контакте" hint="К_ʜᵦ"> 
            <UInput variant="soft" class="w-full" v-model="state.results.K_Hbeta" disabled />
          </UFormField>
          <UFormField name="results.sigma_HP" label="Допускаемое контактное напряжение" hint="σ_ʜᴘ">
            <div class="mb-2" v-html="sigma_HP_result_formula" />
            <UInput variant="soft" class="w-full" v-model="state.results.sigma_HP" disabled />
          </UFormField>
          <UFormField name="results.d_w1" label="Диаметр шестерни" hint="d_w1">
            <div v-html="dw_1_formula" class="mt-2 mb-2" />
            <UInput variant="soft" class="w-full" v-model="state.results.d_w1"  disabled />
          </UFormField>
        </section>
      </UForm>
    </main>
  </UApp>
</template>
<style scoped>
:global(.katex-html) {
  display: none;
}
</style>
