<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types'
import type { H3Error } from 'h3'

import {
  gear_locations,
  load_types,
  material_combinations,
  table_6_5_data,
  type Shaft_rigidity,
} from '~~/server/shared/constants'
import { psi_bd_values_strings, schema, type Schema } from '~~/server/shared/validators'
import katex from 'katex'

const toast = useToast()
const material_values = [...new Set(table_6_5_data.map(t => t.material))]

const state = ref<Schema>({
  u: 1,
  shaft_rigidity: '<ничего>',
  load_type: 'Постоянная',
  n: 100,
  t_hours: 1000,
  material_combination: 'сталь - сталь',
  detail_1: {
    detail_type: 'Прямозубое',
    detail_purpose: 'Ведущее',
    material: 'сталь',
    material_brand: '45',
    heat_type: 'Улучшение',
    psi_bd: '0.2',
    gear_location: 'Симметричное расположение шестерни относительно опор',
    T: 100,
  },
  detail_2: {
    detail_type: 'Прямозубое',
    detail_purpose: 'Ведомое',
    material: 'сталь',
    material_brand: '45',
    heat_type: 'Улучшение',
  },
  results: {
    detail_1: {},
    detail_2: {},
  },
})

const shaft_rigidity_values = computed(() => {
  if (
    state.value.detail_1.gear_location === 'Симметричное расположение шестерни относительно опор' ||
    state.value.detail_1.gear_location === 'Консольное расположение одного из колёс'
  )
    return ['<ничего>'] satisfies Shaft_rigidity[]
  else return ['весьма жёсткий вал', 'менее жёсткий вал'] satisfies Shaft_rigidity[]
})
watch(
  () => state.value.detail_1.gear_location,
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

const onSubmit = async (e: FormSubmitEvent<Schema>) => {
  try {
    const res = await $fetch('/api/compute', { method: 'POST', body: e.data })
    state.value.results = res
  } catch (_e) {
    const e = _e as H3Error
    toast.add({ title: (e.data as { statusMessage: string }).statusMessage, color: 'error' })
  }
}
</script>

<template>
  <UApp>
    <main class="container mx-auto my-16">
      <h1 class="text-2xl font-bold">
        Проектировочный расчет цилиндрической передачи с прямым зубом (ЦПсПз) для коробок передач и
        специальных редукторов
      </h1>

      <UForm
        class="grid grid-cols-[1fr_1fr_1fr] gap-x-12 gap-y-12 mt-8"
        :schema="schema"
        :state="state"
        @submit="onSubmit"
      >
        <section class="flex flex-col gap-4">
          <h2 class="text-xl font-bold w-full">Параметры Сборочной единицы</h2>
          <UFormField hint="u" label="Передаточное число" name="u">
            <UInputNumber v-model="state.u" class="w-full" :max="10" :min="1" />
          </UFormField>
          <UFormField hint="shaft_rigidity" label="Жёсткость вала" name="shaft_rigidity">
            <USelect v-model="state.shaft_rigidity" class="w-full" :items="shaft_rigidity_values" />
          </UFormField>
          <UFormField hint="load_type" label="Тип нагрузки" name="load_type">
            <USelect v-model="state.load_type" class="w-full" disabled :items="[...load_types]" />
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
        <section class="flex flex-col gap-4">
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
          <UFormField hint="T₁" label="Крутящий момент на шестерне" name="T_1">
            <UInputNumber v-model="state.detail_1.T" class="w-full" :max="100000" :min="1" />
          </UFormField>
          <UFormField
            hint="gear_location"
            label="Расположение шестерни"
            name="detail_1.gear_location"
          >
            <USelect
              v-model="state.detail_1.gear_location"
              class="w-full"
              :items="[...gear_locations]"
            />
          </UFormField>
          <UFormField hint="ψ_bd" label="Относительная ширина венца" name="detail_1.psi_bd">
            <USelect
              v-model="state.detail_1.psi_bd"
              class="w-full"
              :items="psi_bd_values_strings"
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
        </section>

        <section class="col-span-3 justify-self-center">
          <UButton type="submit">Вычислить</UButton>
        </section>

        <section class="flex flex-col gap-4">
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
        </section>
        <section class="flex flex-col gap-4">
          <UFormField hint="HB" label="Твердость поверхности зубьев" name="results.detail_1.HB">
            <UInput v-model="state.results.detail_1.HB" class="w-full" disabled variant="soft" />
          </UFormField>
          <UFormField
            hint="N_ʜ₀"
            label="Базовое число циклов перемены напряжений, соответствующее длительному пределу выносливости"
            name="results.detail_1.N_H_0"
          >
            <UInput v-model="state.results.detail_1.HB" class="w-full" disabled variant="soft" />
          </UFormField>
          <UFormField
            hint="N_Σ"
            label="Суммарное число циклов нагружения"
            name="results.detail_1.N_Sum"
          >
            <UInput v-model="state.results.detail_1.N_Sum" class="w-full" disabled variant="soft" />
          </UFormField>
          <UFormField
            hint="N_ʜᴇ"
            label="Эквивалентное число циклов перемены напряжений"
            name="results.detail_1.N_HE"
          >
            <UInput v-model="state.results.detail_1.HB" class="w-full" disabled variant="soft" />
          </UFormField>
          <UFormField hint="K_ʜʟ" label="Коэффициент долговечности" name="results.detail_1.K_HL">
            <div class="mb-2" v-html="K_HL_formula" />
            <UInput v-model="state.results.detail_1.K_HL" class="w-full" disabled variant="soft" />
          </UFormField>
          <UFormField
            hint="σ'_ʜᴘ"
            label="Допускаемое контактное напряжение, соответствующее базовому числу циклов перемены напряжений"
            name="results.detail_1.sigma_ap_HP"
          >
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
          <h3 class="text-2xl font-bold mt-8">Результат</h3>
          <UFormField hint="d_w1" label="Диаметр шестерни" name="results.detail_1.d_w1">
            <div class="mt-2 mb-2" v-html="dw_1_formula" />
            <UInput
              v-model="state.results.detail_1.d_w1"
              class="w-full dark:bg-green-950 bg-green-100"
              disabled
              variant="soft"
            />
          </UFormField>
        </section>
        <section class="flex flex-col gap-4">
          <UFormField hint="HB" label="Твердость поверхности зубьев" name="results.detail_2.HB">
            <UInput v-model="state.results.detail_2.HB" class="w-full" disabled variant="soft" />
          </UFormField>
          <UFormField
            hint="N_ʜ₀"
            label="Базовое число циклов перемены напряжений, соответствующее длительному пределу выносливости"
            name="results.detail_2.N_H_0"
          >
            <UInput v-model="state.results.detail_2.HB" class="w-full" disabled variant="soft" />
          </UFormField>
          <UFormField
            hint="N_Σ"
            label="Суммарное число циклов нагружения"
            name="results.detail_2.N_Sum"
          >
            <UInput v-model="state.results.detail_2.N_Sum" class="w-full" disabled variant="soft" />
          </UFormField>
          <UFormField
            hint="N_ʜᴇ"
            label="Эквивалентное число циклов перемены напряжений"
            name="results.detail_2.N_HE"
          >
            <UInput v-model="state.results.detail_2.HB" class="w-full" disabled variant="soft" />
          </UFormField>
          <UFormField hint="K_ʜʟ" label="Коэффициент долговечности" name="results.detail_2.K_HL">
            <div class="mb-2" v-html="K_HL_formula" />
            <UInput v-model="state.results.detail_2.K_HL" class="w-full" disabled variant="soft" />
          </UFormField>
          <UFormField
            hint="σ'_ʜᴘ"
            label="Допускаемое контактное напряжение, соответствующее базовому числу циклов перемены напряжений"
            name="results.detail_2.sigma_ap_HP"
          >
            <UInput v-model="state.results.detail_2.K_HL" class="w-full" disabled variant="soft" />
          </UFormField>
          <UFormField
            hint="σ_ʜᴘ"
            label="Допускаемое контактное напряжение"
            name="results.detail_2.sigma_HP"
          >
            <div class="mb-2" v-html="sigma_HP_formula" />
            <UInput
              v-model="state.results.detail_2.sigma_ap_HP"
              class="w-full"
              disabled
              variant="soft"
            />
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
