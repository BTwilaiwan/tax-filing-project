import { Component, OnInit, Inject, LOCALE_ID } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { LISTMONTH, LISTYEAR, LISTFILINGTYPE } from './constants/detail.constants';
import * as Icon from '@fortawesome/free-solid-svg-icons';
import { TAXDATA } from '../models/taxData.model';
import { DecimalPipe, formatNumber } from '@angular/common';
import * as _ from 'lodash';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {
  
  public today = new Date();
  public inputDetail!: FormGroup; 
  public listMonth: any[] = []; 
  public listYear: any[] = []; 
  public listFilingType: any[] = []; 
  public filingType = '0'; 
  public invalidTax: boolean = false; 
  public submit: boolean = false; 
  public page = 'Input';
  public taxData: any;
  public icon = Icon;

  constructor(
    private fb: FormBuilder,
    @Inject(LOCALE_ID) private locale: string
  ) {}

  ngOnInit() {
    this.listYear = LISTYEAR;
    this.listFilingType = LISTFILINGTYPE; 
    const currentMonth = this.today.getMonth() + 1;
    const ddlMonth = LISTMONTH.map((item) => ({
      label: item.label,
      value: item.value,
      disable: Number(item.value) > currentMonth ? true : null,
    }))
    this.listMonth = _.cloneDeep(ddlMonth)
    this.initForm();

  }

  initForm() {
    this.inputDetail = this.fb.group({
      month: new FormControl({ value: '0', disabled: false }, [Validators.required]),
      year: new FormControl({ value: '0', disabled: false }, [Validators.required]),
      type: new FormControl({ value: '0', disabled: false }),
      saleAmount: new FormControl({ value: '', disabled: false }, [Validators.required]),
      taxAmount: new FormControl({ value: '', disabled: false }, [Validators.required]),
      surcharge: new FormControl({ value: '', disabled: false }),
      penalty: new FormControl({ value: '', disabled: false }),
      totalAmount: new FormControl({ value: '', disabled: false }),
    })
  }

  numberOnly(fieldName: any) {
    if (this.inputDetail.value[fieldName] != null) {
      this.inputDetail.controls[fieldName].patchValue(this.inputDetail.value[fieldName].replace(/[^0-9.]*/g, ''));
      if (fieldName === 'saleAmount' && this.inputDetail.value.saleAmount !== '') {
        this.submit = false;
        let amount = Number(this.inputDetail.value.saleAmount);
        let numVat = (amount * 0.07);
        let defautTax = Number(numVat.toFixed(2));
        let numSurCharge = (defautTax * 0.1).toFixed(2);
        var numTotal =  (defautTax + Number(numSurCharge) + 200.00).toFixed(2);
        this.inputDetail.patchValue({ 
          saleAmount: formatNumber(amount, this.locale,'1.2-2'),
          taxAmount: formatNumber(defautTax, this.locale,'1.2-2'),
          surcharge: formatNumber(Number(numSurCharge), this.locale,'1.2-2') + ' THB',
          penalty: '200.00 THB',
          totalAmount: formatNumber(Number(numTotal), this.locale,'1.2-2') + ' THB'
        })
      } else if (fieldName === 'taxAmount' && this.inputDetail.value.taxAmount !== '') {
        let numSale = this.inputDetail.value.saleAmount.replace(/[^0-9.]*/g, '')
        let numVat = Number(numSale) * 0.07;
        let defautTax = Number(this.inputDetail.value.taxAmount);
        let numTax = Number(numVat.toFixed(2));
        let checkTax = defautTax <= numTax + 20 && defautTax >= numTax - 20 ? false : true;
        this.invalidTax = checkTax;
        this.inputDetail.patchValue({ taxAmount: defautTax.toLocaleString("en-US") })
      }
    }
  }

  onNext() {
    this.submit = true;
    if (this.inputDetail.valid && this.inputDetail.value.month != '0' &&  this.inputDetail.value.year != '0'
    && this.page === 'Input') {
      this.page = 'Detail';
      const data: TAXDATA = _.cloneDeep(this.inputDetail.value);
      data.filingType = LISTFILINGTYPE.find(e => e.value === this.filingType)?.label;
      this.taxData = data;
      this.inputDetail.controls['month'].disable();
      this.inputDetail.controls['year'].disable();
      this.inputDetail.controls['type'].disable();
      this.inputDetail.controls['saleAmount'].disable();
      this.inputDetail.controls['taxAmount'].disable();
    } 
    else if (this.page === 'Detail') this.page = 'Review';
  }
  onBack() {
    this.submit = false;
    if (this.page === 'Review') this.page = 'Detail';
    else {
      this.page = 'Input';
      this.inputDetail.controls['month'].enable();
      this.inputDetail.controls['year'].enable();
      this.inputDetail.controls['type'].enable();
      this.inputDetail.controls['saleAmount'].enable();
      this.inputDetail.controls['taxAmount'].enable();
    }
  }

  validator(controlName: string): boolean {
    let control = this.inputDetail.controls[controlName]
    return this.inputDetail && control.invalid
  }

}
