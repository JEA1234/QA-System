import { AfterViewInit, Component, ElementRef, forwardRef, Input, OnDestroy, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import flatpickr from 'flatpickr';
import { Instance as FlatpickrInstance } from 'flatpickr/dist/types/instance';

@Component({
  selector: 'app-date-picker', standalone: true,
  template: `<div class="date-picker"><input #input [id]="id" [placeholder]="placeholder" autocomplete="off"><span class="material-symbols-outlined">calendar_month</span></div>`,
  styles: [`.date-picker{position:relative;width:100%}.date-picker input{width:100%;height:40px;padding:0 42px 0 12px;border:1px solid var(--border,#e2e8f0);border-radius:6px;background:#fff;color:var(--on-surface,#0f172a);font:inherit;outline:none}.date-picker input:focus{border-color:var(--primary,#2563eb);box-shadow:0 0 0 3px var(--primary-light,#eff6ff)}.date-picker span{position:absolute;right:12px;top:10px;color:var(--outline,#737686);pointer-events:none}`],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DatePickerComponent), multi: true }]
})
export class DatePickerComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  @Input() id = ''; @Input() placeholder = 'dd/mm/yyyy'; @Input() minDate?: string | Date | null; @Input() maxDate?: string | Date | null;
  @ViewChild('input') input!: ElementRef<HTMLInputElement>; private picker?: FlatpickrInstance; private value = '';
  private onChange: (value: string) => void = () => {}; private onTouched: () => void = () => {};
  ngAfterViewInit(): void { this.picker = flatpickr(this.input.nativeElement, { dateFormat: 'Y-m-d', minDate: this.minDate || undefined, maxDate: this.maxDate || undefined, locale: { firstDayOfWeek: 1, weekdays: { shorthand: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'], longhand: ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'] }, months: { shorthand: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'], longhand: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'] } }, onChange: (_dates, date) => { this.value = date; this.onChange(date); this.onTouched(); } }); if (this.value) this.picker.setDate(this.value, false); }
  writeValue(value: string | null): void { this.value = value || ''; if (this.picker) this.value ? this.picker.setDate(this.value, false) : this.picker.clear(); }
  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; } registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(disabled: boolean): void { if (this.input) this.input.nativeElement.disabled = disabled; } ngOnDestroy(): void { this.picker?.destroy(); }
}
