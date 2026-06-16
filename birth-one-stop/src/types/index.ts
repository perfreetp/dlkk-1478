export interface ApplicantInfo {
  id: string;
  name: string;
  idType: string;
  idNumber: string;
  phone: string;
  address: string;
}

export interface BirthInfo {
  childName: string;
  gender: '男' | '女';
  birthDate: string;
  birthPlace: string;
  hospital: string;
  healthCertificateNo: string;
}

export interface ParentInfo {
  relation: '父亲' | '母亲';
  name: string;
  idType: string;
  idNumber: string;
  phone: string;
  address: string;
}

export interface MaterialItem {
  id: string;
  name: string;
  required: boolean;
  status: '已提供' | '缺失' | '待核验';
  remark?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  department: string;
  selected: boolean;
  required: boolean;
  description: string;
}

export interface ScenarioItem {
  id: string;
  name: string;
  description: string;
  relatedServices: string[];
}

export interface CaseInfo {
  caseNo: string;
  queueNo: string;
  status: '待受理' | '受理中' | '补正' | '审核中' | '已办结' | '已退回';
  applicantType: string;
  applicant: ApplicantInfo;
  birthInfo: BirthInfo;
  father: ParentInfo;
  mother: ParentInfo;
  materials: MaterialItem[];
  services: ServiceItem[];
  createTime: string;
  acceptTime?: string;
  deadline?: string;
  currentNode: string;
  flowHistory: FlowNode[];
}

export interface FlowNode {
  nodeName: string;
  status: '已完成' | '进行中' | '未开始';
  operator: string;
  time: string;
  remark?: string;
}

export interface SupplementOpinion {
  id: string;
  category: string;
  content: string;
  standard: boolean;
}

export interface ReturnReason {
  id: string;
  name: string;
  category: string;
  count: number;
}

export interface DailyStats {
  date: string;
  totalCount: number;
  completedCount: number;
  supplementCount: number;
  returnCount: number;
  avgDuration: number;
}
