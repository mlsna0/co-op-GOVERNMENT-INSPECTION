import { Component, OnInit, ElementRef, ViewChild, ViewChildren, Renderer2, QueryList } from '@angular/core'
import { CdkDragDrop, CdkDragEnd, moveItemInArray } from '@angular/cdk/drag-drop';
import { SignaturePad } from 'angular2-signaturepad';
// import { SignaturePad } from 'angular2-signaturepad/angular2-signaturepad';
import { SignatureService } from '../services/signature.service';
import { ActivatedRoute, Router } from '@angular/router';
import axios from 'axios';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { FormGroup } from '@angular/forms';


@Component({
  selector: 'app-signature',
  templateUrl: './signature.component.html',
  styleUrls: ['./signature.component.css']
})

export class SignatureComponent implements OnInit {
  @ViewChildren('cdkDrag_', { read: ElementRef }) cdkDrag_: QueryList<ElementRef>
  @ViewChild(SignaturePad) signaturePad: SignaturePad;
  @ViewChild('canvasWrapper', { static: false }) canvasWrapper: ElementRef;
  documentId: string;
  stageMarkSign = false;
  dragList: any = [];
  pageVariable = 1
  totalPage: any = 0;
  offset = -100; // ตวามสูงBox
  center = { x: 70, y: 50 }; // ความกว้าง ความสูง หาร 2
  signaturePadOptions: Object = { // passed through to szimek/signature_pad constructor
    'minWidth': 1,
    'canvasWidth': 400,
    'canvasHeight': 200,
    'penColor': 'rgb(0, 0, 255)'
  };
  signatureImg: string;
  step = 0
  useProfileSign 
  signatureProfile
  typeSignature
  caPass
  requestId
  userId
  pdfFile: any = String
  loading = false
  signaturedFile
  errorMessage = null
  user_ca = null
  oca
  
  toastr: any;
  // pdfView: string | ArrayBuffer;
  pdfView: any
  labelImport: any;
  selectedFile: any;
  testFile: string | ArrayBuffer;
  selectedFilePath: string;
  selectedFileB64: string;
  isFileImage: boolean;
  isFileDocument: boolean;
  pdfSrc:any
  uploadForm: FormGroup;
  signatureImage: string | undefined;


  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private router: Router,
    private activateRoute: ActivatedRoute,
    private _sinatureService: SignatureService
  )
    {
    this.requestId = this.activateRoute.snapshot.paramMap.get('requestId')
    this.userId = this.activateRoute.snapshot.paramMap.get('userId')
    this.oca = this.activateRoute.snapshot.paramMap.get('oca')
    this.activateRoute.queryParams.subscribe(params => {
    this.documentId = params['id'];
    });
  }

  ngOnInit(): void {
    this.getData()
    console.log('Document ID:', this.documentId);
    
  }

  async getData() {
    const reader = new FileReader();
    // await axios.get(`https://training.oca.go.th/api/Api_Appove.aspx?requestid=${this.requestId}&userid=${this.userId}`).then(async res => {
    // this.signatureProfile = 'https://' + res.data[0].user_signature
    // this.pdfFile = 'https://' + res.data[0].Upload_path
    // this.user_ca = res.data[0].user_ca
    this.pdfView = reader.result;
    await this.loadingFuction();

    // })
  }
  
  async onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] ?? null;
    
    const btnAddBox = document.getElementById('btn-add-box');

    
    if (this.selectedFile) {
      this.testFile = await this.blobToBase64(event.target.files[0]);
      console.log("test file : ", this.testFile);

      var reader = new FileReader();
      console.log("event.target.files[0] : ", event.target.files[0]);
      reader.readAsDataURL(event.target.files[0]);

      reader.onload = (event) => {
        let path = event.target == null ? '' : event.target.result;
        this.selectedFilePath = path as string;
        this.selectedFileB64 = this.selectedFilePath.split(",")[1];
        this.testFile = reader.result;

        if (this.selectedFilePath.includes('image')) {
          this.isFileImage = true;
          this.isFileDocument = false;
        } else {
          this.isFileImage = false;
          this.isFileDocument = true;
          this.pdfFile = this.selectedFilePath;
        }

        console.log("this is files img: ", this.isFileImage);
        console.log("this is files Doc: ", this.isFileDocument);

        // แสดงปุ่มเมื่อมีไฟล์ถูกเลือก
        if (btnAddBox) {
          btnAddBox.style.display = 'block';
        }
      }
    } else {
      // ซ่อนปุ่มเมื่อไม่มีไฟล์ถูกเลือก
      if (btnAddBox) {
        btnAddBox.style.display = 'none';
      }
    }
  }
blobToBase64(blob: Blob): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  
  clearFileInput(): void {
    this.selectedFile = null;
    this.selectedFilePath = '';
    this.selectedFileB64 = '';
    this.isFileImage = false;
    this.isFileDocument = false;
    this.testFile = undefined;
    this.pdfFile = null;
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    const btnAddBox = document.getElementById('btn-add-box'); // เพิ่มส่วนนี้

    if (fileInput) {
      fileInput.value = '';
    }

    if (btnAddBox) { // เพิ่มส่วนนี้
      btnAddBox.style.display = 'none';
    }
    this.reload();  
  }

  

  startMarkSign() {
    this.stageMarkSign = true;
  }
  pageInitialized(e) {

    if (this.selectedFile === null || this.selectedFile === '') {
      this.totalPage = 0;
    } else {
      this.totalPage = e.source._pages.length
      this.dragList = [];
      this.addDrag(0, { x: 0, y: 0 })
    };

  }
  addDrag(page, pos) {
    console.log("addDrag pos : ", pos);
    this.dragList.push({
      id: "cdkDrag_" + (this.dragList.length == 0 ? 0 : +(this.dragList[this.dragList.length - 1].id.split("_")[1]) + 1),
      page: page,
      position: pos,
      name: "ตำแหน่งลายเซ็น",
    });
    console.log("this.dragList: ", this.dragList);
  }

  selectEle(event) {
    if (this.stageMarkSign) {
      let pageHeight = event.target.clientHeight;
      let pageWidth = event.target.clientWidth;
      let x = event.layerX;
      let y = event.layerY;

      if (event.target.localName == 'canvas') {
        console.log("pageHeight : ", pageHeight);
        console.log("pageWidth : ", pageWidth);
        console.log("x : ", x);
        console.log("y : ", y);

        let flipY = (pageHeight - y);
        console.log("flipY :", -flipY);

        let lengthDragListByPage = this.dragList.filter(x => x.page == this.pageVariable).length;
        let posX = x < this.center.x ? 0 : x > pageWidth - this.center.x ? pageWidth - (this.center.x * 2) : x - this.center.x;
        let posY = flipY < this.center.y ? (this.offset + ((this.offset * lengthDragListByPage))) : flipY > pageHeight - this.center.y ? -(pageHeight - ((this.offset * lengthDragListByPage))) : -(flipY - ((this.offset * lengthDragListByPage))) - this.center.y;
        this.dragList[this.dragList.length - 1].page = this.pageVariable;
        this.dragList[this.dragList.length - 1].position = {
          x: posX,
          y: posY
        }
        this.dragList[this.dragList.length - 1].index = lengthDragListByPage

        let ck = this.cdkDrag_.find((x, i) => x.nativeElement.id == this.dragList[this.dragList.length - 1].id).nativeElement;
        this.addDrag(0, { x: 0, y: 0 })

        if (!(ck == null || ck == 'null')) {
          ck.style.display = ck.style.display == 'none' ? 'block' : 'block'
          // let page = event.target.ariaLabel.split(" ")[1];
          // let pdf = this.elementRef.nativeElement.querySelector(`[data-page-number="${page}"] .canvasWrapper`);
          let pdf = this.elementRef.nativeElement.querySelector(`.canvasWrapper`);
          console.log("this.dragList : ", this.dragList);

          pdf.append(ck);
        }
        this.stageMarkSign = false;
      }
    }
  }
  dragEnd($event: CdkDragEnd) {
    // console.log("event :",$event.source);
    // console.log("clientWidth :",$event.source.element.nativeElement.parentElement.clientWidth+ " // clientHeight: " + $event.source.element.nativeElement.parentElement.clientHeight);
    let id = $event.source.element.nativeElement.id;
    let pos = $event.source.getFreeDragPosition();
    console.log("pos :", pos);

    let ckDragIndex = this.dragList.findIndex(x => x.id == id);
    if (ckDragIndex != -1) {
      this.dragList[ckDragIndex].position = { x: pos.x, y: pos.y }
    }

    console.log("this.dragList :", this.dragList);

  }
  remove(id, page) {
    let indexDragList = this.dragList.findIndex(x => x.id == id);
    if (indexDragList != -1) {
      this.dragList.splice(indexDragList, 1)
    }

    // ลบ element
    const ck = this.cdkDrag_.find((x, i) => x.nativeElement.id == id);
    if (ck) {
      this.renderer.removeChild(this.elementRef.nativeElement, ck.nativeElement);
    }

    console.log("this.dragList: ", this.dragList);

    // re index
    let listinPage = this.dragList.filter((value, index, self) =>
      index === self.findIndex((t) => (
        t.page === value.page && t.page != 0
      )))
    let listPage = [];
    listinPage.forEach(element => {
      listPage.push(element.page);
    });
    listPage.forEach(elePage => {
      let dragListByPageFilter = this.dragList.filter(x => x.page == elePage);
      dragListByPageFilter.forEach((element, index) => {
        // re position Y
        let removeNumber = +(id.split("_")[1]);
        let curNumber = +(element.id.split("_")[1]);
        if (curNumber > removeNumber && element.page == page) {
          element.position = { x: element.position.x, y: (element.position.y - (this.offset)) }
        }
        // re index
        element.index = index
      });
    })
    console.log("this.dragList reindex: ", this.dragList);
  }

  drawComplete() {
    // will be notified of szimek/signature_pad's onEnd event
    console.log(this.signaturePad.toDataURL());
  }

  drawStart() {
    // will be notified of szimek/signature_pad's onBegin event
    console.log('begin drawing');
  }

  async submitSign() {
    console.log('dragList:', this.dragList);
    this.loading = false
    let signData;

    if (this.dragList.length > 1) {
      console.log("test", this.dragList.length);
      
      const pdf = this.elementRef.nativeElement as HTMLElement;
      const canvasWrapper = pdf.querySelector<HTMLElement>(".canvasWrapper")
      console.log('canvasWrapper:', canvasWrapper);
      
      let clientWidth = canvasWrapper.clientWidth;
      let clientHeight = canvasWrapper.clientHeight;

      let result = []
      this.dragList.forEach((element, index) => {
        if ((this.dragList.length - 1) != index) {
          let convertPositive = (element.position.y - (this.offset * (element.index))) / -1;
          let x = element.position.x + this.center.x;
          let y = convertPositive - this.center.y;

          let x1 = x + this.center.x;
          let x2 = x - this.center.x;
          let y1 = y + this.center.y;
          let y2 = y - this.center.y;

          result.push({
            "page": element.page,
            "position_px": { x: x, y: y },
            "position_percentage": {
              x: (x / clientWidth) * 100,
              y: (y / clientHeight) * 100
            },
            "signSize": {
              x1: (x1 / clientWidth) * 100,
              x2: (x2 / clientWidth) * 100,
              y1: (y1 / clientHeight) * 100,
              y2: (y2 / clientHeight) * 100,
            }
          })
        }
      });
      signData = JSON.stringify(result)
    }

    let base64Data
    this.typeSignature == 'ca' ? this.useProfileSign = true : ''

    if (this.useProfileSign == true) {
      getBase64ImageFromUrl(`${this.signatureProfile}`)
        .then((result: any) => {
          console.log("result => ", result)
          base64Data = result
        }).then(res2 => {
          this.signatureImg = base64Data
          compressImage(this.signatureImg, 200, 100)
            .then((compressed: any) => {
              this.signatureImg = compressed;
              fetch(this.pdfFile)
                .then(response => response.blob())
                .then(data => {

                  if (this.typeSignature == 'ca') {
                    let formData = new FormData

                    formData.append('base64', compressed);
                    formData.append('signData', signData);
                    formData.append('requestId', this.requestId);
                    formData.append('userId', this.userId);
                    formData.append('type', this.typeSignature);
                    formData.append('pdfFile', new File([data], 'signaturedFile.pdf', { type: 'application/pdf' }));
                    formData.append('caPass', this.caPass);
                    formData.append('user_ca', this.user_ca);
                    formData.append('oca', this.oca);

                    this._sinatureService.signature(formData).subscribe((res: any) => {
                      if (res.status == false) {
                        this.errorMessage = '*' + res.message
                        return;
                      } else {
                        this.errorMessage = null
                        this.step = 2
                        this.signaturedFile = res
                      }
                    })

                  } else {
                    let formData = new FormData

                    formData.append('base64', compressed);
                    formData.append('signData', signData);
                    formData.append('requestId', this.requestId);
                    formData.append('userId', this.userId);
                    formData.append('type', this.typeSignature);
                    formData.append('pdfFile', new File([data], 'signaturedFile.pdf', { type: 'application/pdf' }));
                    formData.append('oca', this.oca);

                    this._sinatureService.signature(formData).subscribe((res: any) => {
                      this.step = 2
                      this.signaturedFile = res
                    })
                  }
                })
            })
        })
        .catch(err => console.error(err));
    } else {
      base64Data = this.signaturePad.toDataURL();
      this.signatureImg = base64Data;

      compressImage(this.signatureImg, 200, 100)
        .then((compressed: any) => {
          this.signatureImg = compressed;
          fetch(this.pdfFile)
            .then(response => response.blob())
            .then(data => {
              let formData = new FormData

              formData.append('type', this.typeSignature);
              formData.append('base64', compressed);
              formData.append('signData', signData);
              formData.append('requestId', this.requestId);
              formData.append('userId', this.userId);
              formData.append('pdfFile', new File([data], 'signaturedFile.pdf', { type: 'application/pdf' }));
              formData.append('oca', this.oca);
              
              this._sinatureService.signature(formData).subscribe((res: any) => {
                this.step = 2
                this.signaturedFile = res
              })
            })
        })
    }

    async function getBase64ImageFromUrl(imageUrl) {
      var res = await fetch(imageUrl);
      var blob = await res.blob();

      return new Promise((resolve, reject) => {
        var reader = new FileReader();
        reader.addEventListener("load", function () {
          resolve(reader.result);
        }, false);

        // reader.onerror = () => {
        //   return reject(this);
        // };
        reader.readAsDataURL(blob);
      })
    }

      function compressImage(src, newX, newY) {
        console.log("1111");
        
        return new Promise((res, rej) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            const elem = document.createElement('canvas');
            elem.width = newX;
            elem.height = newY;
            const ctx = elem.getContext('2d');
            ctx.drawImage(img, 0, 0, newX, newY);
            const data = ctx.canvas.toDataURL();
            res(data);
          }
          img.onerror = error => rej(error);
        })
      }
    await this.loadingFuction() 
  }
  
  loadingFuction() {
    this.loading = true
  }
  base64toBlob(base64) {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/png', });
    let operationSheet_file = new File([blob], 'signature.png', { type: 'image/png' });
    return operationSheet_file
  }

  clearSignature() {
    this.signaturePad.clear();
  }
  reload() {
    this.step = 0;
    this.selectedFile = this.signaturedFile;
    // window.location.reload()
  }
  async lastSubmit() {
    this.loading = false
    // await axios.get(`https://training.oca.go.th/api/Api_AppoveRequest.aspx?requestid=${this.requestId}&userid=${this.userId}&filename=${this.oca}${this.requestId}${this.userId}.pdf`).then((res: any) => {
    //   if (res.data[0].resultCode == "20000") {
    //     this.loading = true
    //     window.location.href = `https://training.oca.go.th/admin/Adm_ListRequest.aspx?ReqStID=${this.requestId}`;
    //   }
    // })

    window.location.reload()
    // this.reload();
  }
  useProfileSignCheckbox(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this.useProfileSign = inputElement.checked;
    console.log('useProfileSign:', this.useProfileSign);
  }
  choseTypeSignature(value) {
    console.log('Selected PDF source:', value);
    this.typeSignature = value
    this.step++;
  }
  getPDFUrlFromPin(pin: string): string {
    // Example logic to determine the URL
    return `https://example.com/path/to/pdf/${pin}.pdf`;
  }

  BackRoot() {
    this.router.navigate(['/table-detail',this.documentId]);
  }

  // prevPage() {
  //   if (this.pageVariable > 1) {
  //     this.pageVariable--;
  //     this.onPageChange();
  //   }
  // }

  // nextPage() {
  //   if (this.pageVariable < this.totalPage) {
  //     this.pageVariable++;
  //     this.onPageChange();
  //   }
  // }


  onPageChange() {
    // Ensure the page number stays within bounds
    if (this.pageVariable < 1) {
      this.pageVariable = 1;
    } else if (this.pageVariable > this.totalPage) {
      this.pageVariable = this.totalPage;
    }
    this.updatePageDisplay();
    // Add any other logic needed when the page changes
    // For example, reloading the document to show the new page
  }

  updatePageDisplay() {
    const pageDisplayElement = document.getElementById('pageDisplay');
    if (pageDisplayElement) {
      pageDisplayElement.textContent = `จำนวนหน้า: ${this.pageVariable}/${this.totalPage}`;
    }
  }
  prevPage() {
    if (this.pageVariable > 1) {
      this.pageVariable--;
      this.updatePageDisplay();
    }
  }

  nextPage() {
    if (this.pageVariable < this.totalPage) {
      this.pageVariable++;
      this.updatePageDisplay();
    }
  }
}
