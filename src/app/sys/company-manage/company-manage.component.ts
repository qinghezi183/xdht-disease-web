import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpService} from '../../core/http/http.service';
import {ToastConfig} from '../../toast/toast-config';
import {SimpleDataHttpPageComponent} from '../../simple-data-table/simple-data-http-page/simple-data-http-page.component';
import {ConfirmConfig} from '../../modal/confirm/confirm-config';
import {ToastType} from '../../toast/toast-type.enum';
import {UserEditComponent} from '../user-edit/user-edit.component';
import {ModalService} from '../../modal/modal.service';
import {SystemConstant} from '../../core/class/system-constant';
import {WaitService} from '../../core/wait/wait.service';
import {ToastService} from '../../toast/toast.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-company-manage',
  templateUrl: './company-manage.component.html',
  styleUrls: ['./company-manage.component.scss']
})
export class CompanyManageComponent implements OnInit {

  url: String;
  method: 'post';

  @ViewChild('sdhp', undefined) sdhp: SimpleDataHttpPageComponent;
  /**
   * 查询条件
   */
  param: any = {
    companyName: ''
  };
  constructor(
    private ngbModal: NgbModal,
    private waitService: WaitService,
    private modalService: ModalService,
    private httpService: HttpService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.url = SystemConstant.COMPANY_PAGE_LIST;
  }

  /**
   * 查询
   */
  search() {
    this.waitService.wait(true);
    this.sdhp.search();
    this.waitService.wait(false);
  }

  /**
   * 新增用户
   */
  addCompany() {
    const modalRef = this.ngbModal.open(UserEditComponent);
    modalRef.result.then(
      (result) => {
        if (result === 'success') {
          this.search();
        }
      }
    );
  }

  /**
   * 修改用户
   */
  editCompany(userId) {
    // 获取用户数据
    this.httpService.get(SystemConstant.USER_DETAIL + '/' + userId).subscribe({
      next: (data) => {
        this.openEditUser(data);
      },
      error: (err) => {
        const toastCfg = new ToastConfig(ToastType.ERROR, '', '获取用户详情失败！' + '失败原因：' + err, 3000);
        this.toastService.toast(toastCfg);
      },
      complete: () => {}
    });
  }

  /**
   * 打开修改用户对话框
   */
  openEditUser(userData) {
    const modalRef = this.ngbModal.open(UserEditComponent);
    modalRef.componentInstance.userData = userData;
    modalRef.result.then(
      (result) => {
        if (result === 'success') {
          this.search();
        }
      }
    );
  }

  /**
   * 删除用户
   */
  delCompany(userId, userName) {
    const confirmCfg = new ConfirmConfig('确定删除用户：' + userName + '！');
    this.modalService.confirm(confirmCfg).then(
      () => {
        this.httpService.get(SystemConstant.USER_DEL + '?id=' + userId).subscribe({
          next: (data) => {
            const status = data.status;
            if (status === '1') {
              const toastCfg = new ToastConfig(ToastType.SUCCESS, '', '删除用户成功！', 3000);
              this.toastService.toast(toastCfg);
              this.search();
            } else {
              const toastCfg = new ToastConfig(ToastType.ERROR, '', '删除用户失败！' + '失败原因：' + data.message, 3000);
              this.toastService.toast(toastCfg);
            }
          },
          error: (err) => {
            const toastCfg = new ToastConfig(ToastType.ERROR, '',  '删除用户失败！' + '失败原因：' + err, 3000);
            this.toastService.toast(toastCfg);
          },
          complete: () => {}
        });
      }
    );
  }

}
