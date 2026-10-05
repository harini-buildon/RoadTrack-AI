import { ModelVersion, ModelMetrics } from '../../types';
import { db } from '../db/inMemoryDb';

export class ModelEvaluationService {
  /**
   * Return model registry and benchmark statistics
   */
  static getActiveModelInfo(): {
    activeModel: ModelVersion;
    allModels: ModelVersion[];
    benchmarkSummary: ModelMetrics;
  } {
    const active = db.modelVersions.find((m) => m.status === 'ACTIVE_PRODUCTION') || db.modelVersions[0];
    return {
      activeModel: active,
      allModels: db.modelVersions,
      benchmarkSummary: active.metrics
    };
  }

  /**
   * Switch active production model (Canary A/B Deployment)
   */
  static setActiveModel(modelId: string, userId: string, userName: string): ModelVersion {
    db.modelVersions.forEach((m) => {
      if (m.id === modelId) {
        m.status = 'ACTIVE_PRODUCTION';
      } else if (m.status === 'ACTIVE_PRODUCTION') {
        m.status = 'CANARY_TESTING';
      }
    });

    db.addAuditLog({
      userId,
      userName,
      userRole: 'SUPER_ADMIN',
      action: 'model_deployment_switch',
      resource: `/api/v1/models/${modelId}/activate`,
      queryReason: 'Switched production route prediction model version in registry',
      ipAddress: '10.240.12.10',
      resultStatus: 'SUCCESS',
      metadataJson: JSON.stringify({ activatedModelId: modelId })
    });

    return db.modelVersions.find((m) => m.id === modelId)!;
  }
}
