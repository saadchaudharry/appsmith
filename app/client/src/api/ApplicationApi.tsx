import Api from "api/Api";
import { ApiResponse } from "./ApiResponses";
import { AxiosPromise } from "axios";
import { AppColorCode } from "constants/DefaultTheme";
import { AppIconName } from "components/ads/AppIcon";
import { AppLayoutConfig } from "reducers/entityReducers/pageListReducer";

export interface PublishApplicationRequest {
  applicationId: string;
}

export interface ChangeAppViewAccessRequest {
  applicationId: string;
  publicAccess: boolean;
}

export interface PublishApplicationResponse extends ApiResponse {
  data: unknown;
}

export interface ApplicationPagePayload {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface ApplicationResponsePayload {
  id: string;
  name: string;
  organizationId: string;
  pages?: ApplicationPagePayload[];
  appIsExample: boolean;
  appLayout?: AppLayoutConfig;
  unreadCommentThreads?: number;
}

export interface FetchApplicationResponse extends ApiResponse {
  data: ApplicationResponsePayload & { pages: ApplicationPagePayload[] };
}

export interface FetchApplicationsResponse extends ApiResponse {
  data: Array<ApplicationResponsePayload & { pages: ApplicationPagePayload[] }>;
}

export interface CreateApplicationResponse extends ApiResponse {
  data: ApplicationResponsePayload;
}

export interface CreateApplicationRequest {
  name: string;
  orgId: string;
  color?: AppColorCode;
  icon?: AppIconName;
}

export interface SetDefaultPageRequest {
  id: string;
  applicationId: string;
}

export interface DeleteApplicationRequest {
  applicationId: string;
}

export interface DuplicateApplicationRequest {
  applicationId: string;
}

export interface ForkApplicationRequest {
  applicationId: string;
  organizationId: string;
}

export interface GetAllApplicationResponse extends ApiResponse {
  data: Array<ApplicationResponsePayload & { pages: ApplicationPagePayload[] }>;
}

export type UpdateApplicationPayload = {
  icon?: string;
  color?: string;
  name?: string;
  currentApp?: boolean;
  appLayout?: AppLayoutConfig;
};

export type UpdateApplicationRequest = UpdateApplicationPayload & {
  id: string;
};

export interface ApplicationObject {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  organizationId: string;
  pages: ApplicationPagePayload[];
  userPermissions: string[];
}

export interface UserRoles {
  name: string;
  roleName: string;
  username: string;
}

export interface OrganizationApplicationObject {
  applications: Array<ApplicationObject>;
  organization: {
    id: string;
    name: string;
  };
  userRoles: Array<UserRoles>;
}
export interface FetchUsersApplicationsOrgsResponse extends ApiResponse {
  data: {
    organizationApplications: Array<OrganizationApplicationObject>;
    user: string;
    newReleasesCount: string;
    releaseItems: Array<Record<string, any>>;
  };
}

export interface ImportApplicationRequest {
  orgId: string;
  applicationFile?: File;
  progress?: (progressEvent: ProgressEvent) => void;
  onSuccessCallback?: () => void;
}

class ApplicationApi extends Api {
  static baseURL = "v1/applications/";
  static publishURLPath = (applicationId: string) => `publish/${applicationId}`;
  static createApplicationPath = (orgId: string) => `?orgId=${orgId}`;
  static changeAppViewAccessPath = (applicationId: string) =>
    `${applicationId}/changeAccess`;
  static setDefaultPagePath = (request: SetDefaultPageRequest) =>
    `${ApplicationApi.baseURL}${request.applicationId}/page/${request.id}/makeDefault`;
  static publishApplication(
    publishApplicationRequest: PublishApplicationRequest,
  ): AxiosPromise<PublishApplicationResponse> {
    return Api.post(
      ApplicationApi.baseURL +
        ApplicationApi.publishURLPath(publishApplicationRequest.applicationId),
      undefined,
      {},
    );
  }
  static fetchApplications(): AxiosPromise<FetchApplicationsResponse> {
    return Api.get(ApplicationApi.baseURL);
  }

  static getAllApplication(): AxiosPromise<GetAllApplicationResponse> {
    return Api.get(ApplicationApi.baseURL + "new");
  }

  static fetchApplication(
    applicationId: string,
  ): AxiosPromise<FetchApplicationResponse> {
    return Api.get(ApplicationApi.baseURL + applicationId);
  }

  static fetchAppLibraries(): Promise<ApiResponse> {
    const libs = [
      {
        name: "d3",
        latest: "https://cdnjs.cloudflare.com/ajax/libs/d3/7.0.1/d3.min.js",
        filename: "d3.min.js",
        description: "A JavaScript visualization library for HTML and SVG.",
        version: "7.0.1",
      },
      {
        name: "axios",
        latest:
          "https://cdnjs.cloudflare.com/ajax/libs/axios/0.21.1/axios.min.js",
        filename: "axios.min.js",
        description: "Promise based HTTP client for the browser and node.js",
        version: "0.21.1",
      },
    ];
    return Promise.resolve({
      responseMeta: {
        status: 200,
        success: true,
      },
      data: libs,
    });
    // return Api.get(ApplicationApi.baseURL + applicationId + "/libraries");
  }

  static fetchApplicationForViewMode(
    applicationId: string,
  ): AxiosPromise<FetchApplicationResponse> {
    return Api.get(ApplicationApi.baseURL + `view/${applicationId}`);
  }

  static createApplication(
    request: CreateApplicationRequest,
  ): AxiosPromise<PublishApplicationResponse> {
    return Api.post(
      ApplicationApi.baseURL +
        ApplicationApi.createApplicationPath(request.orgId),
      { name: request.name, color: request.color, icon: request.icon },
    );
  }

  static setDefaultApplicationPage(
    request: SetDefaultPageRequest,
  ): AxiosPromise<ApiResponse> {
    return Api.put(ApplicationApi.setDefaultPagePath(request));
  }

  static changeAppViewAccess(
    request: ChangeAppViewAccessRequest,
  ): AxiosPromise<ApiResponse> {
    return Api.put(
      ApplicationApi.baseURL +
        ApplicationApi.changeAppViewAccessPath(request.applicationId),
      { publicAccess: request.publicAccess },
    );
  }

  static updateApplication(
    request: UpdateApplicationRequest,
  ): AxiosPromise<ApiResponse> {
    const { id, ...rest } = request;
    return Api.put(ApplicationApi.baseURL + id, rest);
  }

  static deleteApplication(
    request: DeleteApplicationRequest,
  ): AxiosPromise<ApiResponse> {
    return Api.delete(ApplicationApi.baseURL + request.applicationId);
  }

  static duplicateApplication(
    request: DuplicateApplicationRequest,
  ): AxiosPromise<ApiResponse> {
    return Api.post(ApplicationApi.baseURL + "clone/" + request.applicationId);
  }

  static forkApplication(
    request: ForkApplicationRequest,
  ): AxiosPromise<ApiResponse> {
    return Api.post(
      "v1/applications/" +
        request.applicationId +
        "/fork/" +
        request.organizationId,
    );
  }

  static importApplicationToOrg(
    request: ImportApplicationRequest,
  ): AxiosPromise<ApiResponse> {
    const formData = new FormData();
    if (request.applicationFile) {
      formData.append("file", request.applicationFile);
    }
    return Api.post("v1/applications/import/" + request.orgId, formData, null, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: request.progress,
    });
  }
}

export default ApplicationApi;
