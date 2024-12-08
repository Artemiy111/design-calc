<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'

import { execute } from '~~/server/shared/computations'
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
  table_6_5_data,
  type Psi_bd,
  type Shaft_rigidity,
} from '~~/server/shared/constants'
import katex from 'katex'
import { z } from 'zod'

const toast = useToast()
const material_values = [...new Set(table_6_5_data.map(t => t.material))]

const psi_bd_values_strings = psi_bd_values.map(String) as [
  '0.2',
  '0.4',
  '0.6',
  '0.8',
  '1.0',
  '1.2',
  '1.4',
  '1.6',
]
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
    load_type: z.enum(load_types),
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
  }),
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
    load_type: 'Постоянная',
    psi_bd: '0.2',
  },
  detail_2: {
    detail_type: 'Прямозубое',
    detail_purpose: 'Ведомое',
    material: 'сталь',
    material_brand: '45',
    heat_type: 'Улучшение',
    load_type: 'Постоянная',
  },
  results: {
    detail_1: {},
    detail_2: {},
  },
})

const shaft_rigidity_values = computed(() => {
  if (
    state.value.gear_location === 'Симметричное расположение шестерни относительно опор' ||
    state.value.gear_location === 'Консольное расположение одного из колёс'
  )
    return ['<ничего>'] satisfies Shaft_rigidity[]
  else return ['весьма жёсткий вал', 'менее жёсткий вал'] satisfies Shaft_rigidity[]
})
watch(
  () => state.value.gear_location,
  () => {
    state.value.shaft_rigidity = shaft_rigidity_values.value[0]!
  },
)

const detail_1_material_brands = computed(() => [
  ...new Set(
    table_6_5_data
      .filter(t => t.material === state.value.detail_1.material)
      .map(t => t.material_brand),
  ),
])
const detail_1_heat_types = computed(() => [
  ...new Set(
    table_6_5_data
      .filter(
        t =>
          t.material === state.value.detail_1.material &&
          t.material_brand === state.value.detail_1.material_brand,
      )
      .map(t => t.heat_type),
  ),
])
watch(
  () => state.value.detail_1.material,
  () => {
    state.value.detail_1.material_brand = detail_1_material_brands.value[0]!
  },
)
watch(
  () => state.value.detail_1.material_brand,
  () => {
    state.value.detail_1.heat_type = detail_1_heat_types.value[0]!
  },
)
const detail_2_material_brands = computed(() => [
  ...new Set(
    table_6_5_data
      .filter(t => t.material === state.value.detail_2.material)
      .map(t => t.material_brand),
  ),
])
const detail_2_heat_types = computed(() => [
  ...new Set(
    table_6_5_data
      .filter(
        t =>
          t.material === state.value.detail_2.material &&
          t.material_brand === state.value.detail_2.material_brand,
      )
      .map(t => t.heat_type),
  ),
])
watch(
  () => state.value.detail_2.material,
  () => {
    state.value.detail_2.material_brand = detail_2_material_brands.value[0]!
  },
)
watch(
  () => state.value.detail_2.material_brand,
  () => {
    state.value.detail_2.heat_type = detail_2_heat_types.value[0]!
  },
)

const dw_1_formula = katex.renderToString(
  `d_{w1} = K_d \\ \\sqrt[3]{\\dfrac{T_1 K_{H\\beta} (u \\pm 1)}{u \\psi_{bd} \\sigma^2_{H P}}}`,
)
const K_HL_formula = katex.renderToString(`K_{HL} = \\sqrt[6]{N_{H_0} / N_{HE}}`)
const sigma_HP_formula = katex.renderToString(`\\sigma_{HP} = \\sigma'_{HP} / K_{HL}`)
const sigma_HP_result_formula = katex.renderToString(
  `\\sigma_{HP} = min(\\sigma_{HP_1}, \\sigma_{HP_2})`,
)

const onSubmit = (e: FormSubmitEvent<Schema>) => {
  const data = e.data
  console.log(data)
  try {
    const res = execute({
      ...data,
      detail_1: { ...data.detail_1, psi_bd: parseFloat(e.data.detail_1.psi_bd) as Psi_bd },
    })
    console.log(res)
    state.value.results = res
  } catch (_e) {
    const e = _e as Error
    toast.add({ title: e.message, color: 'error' })
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
        class="grid grid-cols-[max-content_max-content_max-content] gap-x-16 gap-y-12 mt-8"
        :schema="schema"
        :state="state"
        @submit="onSubmit"
      >
        <section class="flex flex-col w-110 gap-4">
          <h2 class="text-xl font-bold w-full">Параметры Сборочной единицы</h2>
          <UFormField hint="u" label="Номер передачи" name="u">
            <UInputNumber v-model="state.u" class="w-full" :max="10" :min="1" />
          </UFormField>
          <UFormField hint="gear_location" label="Расположение шестерни" name="gear_location">
            <USelect v-model="state.gear_location" class="w-full" :items="[...gear_locations]" />
          </UFormField>
          <UFormField hint="shaft_rigidity" label="Жёсткость вала" name="shaft_rigidity">
            <USelect v-model="state.shaft_rigidity" class="w-full" :items="shaft_rigidity_values" />
          </UFormField>
          <UFormField hint="load_type" label="Тип нагрузки" name="load_type">
            <USelect v-model="state.load_type" class="w-full" disabled :items="[...load_types]" />
          </UFormField>
          <UFormField hint="T₁" label="Крутящий момент на шестерне" name="T_1">
            <UInputNumber v-model="state.T_1" class="w-full" :max="100000" :min="1" />
          </UFormField>
          <UFormField hint="n" label="Частота вращения" name="n">
            <UInputNumber v-model="state.n" class="w-full" :max="100000" :min="1" />
          </UFormField>
          <UFormField
            hint="t_ч"
            label="Полное число часов работы передачи за срок службы"
            name="t_hours"
          >
            <UInputNumber v-model="state.t_hours" class="w-full" :max="100000" :min="100" />
          </UFormField>
          <UFormField
            hint="material_combination"
            label="Комбинация материалов зубатых колёс"
            name="material_combination"
          >
            <USelect
              v-model="state.material_combination"
              class="w-full"
              :items="[...material_combinations]"
            />
          </UFormField>
        </section>
        <section class="flex flex-col w-110 gap-4">
          <h2 class="text-xl font-bold">Параметры шестерни</h2>
          <UFormField hint="detail_type" label="Тип зубчатого колеса" name="detail_1.detail_type">
            <UInput v-model="state.detail_1.detail_type" class="w-full" disabled />
          </UFormField>
          <UFormField
            hint="detail_purpose"
            label="Назначение зубчатого колеса"
            name="detail_1.detail_purpose"
          >
            <UInput v-model="state.detail_1.detail_purpose" class="w-full" disabled />
          </UFormField>
          <UFormField hint="material" label="Материал" name="detail_1.material">
            <USelect v-model="state.detail_1.material" class="w-full" :items="material_values" />
          </UFormField>
          <UFormField hint="material_brand" label="Марка материала" name="detail_1.material_brand">
            <USelect
              v-model="state.detail_1.material_brand"
              class="w-full"
              :items="detail_1_material_brands"
            />
          </UFormField>
          <UFormField hint="heat_type" label="Термообработка" name="detail_1.heat_type">
            <USelect
              v-model="state.detail_1.heat_type"
              class="w-full"
              :items="detail_1_heat_types"
            />
          </UFormField>
          <UFormField hint="ψ_bd" label="Относительная ширина венца" name="detail_1.psi_bd">
            <USelect
              v-model="state.detail_1.psi_bd"
              class="w-full"
              :items="psi_bd_values_strings"
            />
          </UFormField>
          <UFormField hint="K_ʜʟ" label="Коэффициент долговечности" name="results.K_HL">
            <div class="mb-2" v-html="K_HL_formula" />
            <UInput v-model="state.results.detail_1.K_HL" class="w-full" disabled variant="soft" />
          </UFormField>
          <UFormField
            hint="σ_ʜᴘ"
            label="Допускаемое контактное напряжение"
            name="results.detail_1.sigma_HP"
          >
            <div class="mb-2" v-html="sigma_HP_formula" />
            <UInput
              v-model="state.results.detail_1.sigma_HP"
              class="w-full"
              disabled
              variant="soft"
            />
          </UFormField>
        </section>
        <section class="flex flex-col gap-4">
          <h2 class="text-xl font-bold">Параметры ведомого зубчатого колеса</h2>
          <UFormField hint="detail_type" label="Тип зубчатого колеса" name="detail_1.detail_type">
            <UInput v-model="state.detail_1.detail_type" class="w-full" disabled />
          </UFormField>
          <UFormField
            hint="detail_purpose"
            label="Назначение зубчатого колеса"
            name="detail_2.detail_purpose"
          >
            <UInput v-model="state.detail_2.detail_purpose" class="w-full" disabled />
          </UFormField>
          <UFormField hint="material" label="Материал" name="detail_2.material">
            <USelect v-model="state.detail_2.material" class="w-full" :items="material_values" />
          </UFormField>
          <UFormField hint="material_brand" label="Марка материала" name="detail_2.material_brand">
            <USelect
              v-model="state.detail_2.material_brand"
              class="w-full"
              :items="detail_2_material_brands"
            />
          </UFormField>
          <UFormField hint="heat_type" label="Термообработка" name="detail_2.heat_type">
            <USelect
              v-model="state.detail_2.heat_type"
              class="w-full"
              :items="detail_2_heat_types"
            />
          </UFormField>
          <UFormField hint="K_ʜʟ" label="Коэффициент долговечности" name="results.K_HL">
            <UInput v-model="state.results.detail_1.K_HL" class="w-full" disabled variant="soft" />
          </UFormField>
          <UFormField
            hint="σ_ʜᴘ"
            label="Допускаемое контактное напряжение"
            name="results.detail_2.sigma_HP"
          >
            <UInput
              v-model="state.results.detail_2.sigma_ap_HP"
              class="w-full"
              disabled
              variant="soft"
            />
          </UFormField>
        </section>
        <section class="flex flex-col gap-4">
          <UButton class="w-fit" type="submit">Вычислить</UButton>
          <h3 class="text-xl font-bold">Результаты</h3>
          <UFormField hint="К_d" label="Вспомогательный коэффициент" name="results.K_d">
            <UInput v-model="state.results.K_d" class="w-full" disabled variant="soft" />
          </UFormField>
          <UFormField
            hint="К_ʜᵦ"
            label="Коэффициент, учитывающий распределение нагрузки по ширине венца при контакте"
            name="results.K_Hbeta"
          >
            <UInput v-model="state.results.K_Hbeta" class="w-full" disabled variant="soft" />
          </UFormField>
          <UFormField hint="σ_ʜᴘ" label="Допускаемое контактное напряжение" name="results.sigma_HP">
            <div class="mb-2" v-html="sigma_HP_result_formula" />
            <UInput v-model="state.results.sigma_HP" class="w-full" disabled variant="soft" />
          </UFormField>
          <UFormField hint="d_w1" label="Диаметр шестерни" name="results.d_w1">
            <div class="mt-2 mb-2" v-html="dw_1_formula" />
            <UInput v-model="state.results.d_w1" class="w-full" disabled variant="soft" />
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
