// src/components/viewer/ViewerUtils.js
import * as THREE from 'three';

export class ViewerUtils {
  // Setup della camera in base al modello
  static setupCameraForModel(camera, model) {
    if (!model?.items?.size) return;

    try {
      const bbox = new THREE.Box3();
      model.items.forEach(mesh => {
        if (mesh?.geometry) {
          mesh.geometry.computeBoundingSphere();
          bbox.expandByObject(mesh);
        }
      });

      const center = new THREE.Vector3();
      bbox.getCenter(center);
      const size = bbox.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const distance = maxDim * 2;

      camera.controls.setLookAt(
        center.x + distance,
        center.y + distance,
        center.z + distance,
        center.x,
        center.y,
        center.z,
        true
      );
    } catch (error) {
      console.warn('Error setting up camera for model:', error);
    }
  }

  // Ottimizzazione delle performance del modello
  static optimizeModelPerformance(model) {
    if (!model?.items) return;

    model.items.forEach(mesh => {
      if (mesh) {
        // Ottimizza la geometria
        if (mesh.geometry) {
          mesh.geometry.computeBoundingSphere();
          mesh.geometry.computeBoundingBox();
        }

        // Imposta il frustum culling
        mesh.frustumCulled = true;

        // Ottimizza i materiali
        if (mesh.material) {
          mesh.material.side = THREE.FrontSide;
          // Usa il matcap material per migliori performance se disponibile
          if (mesh.material.type === 'MeshStandardMaterial') {
            mesh.material = new THREE.MeshMatcapMaterial({
              color: mesh.material.color,
              opacity: mesh.material.opacity,
              transparent: mesh.material.transparent
            });
          }
        }
      }
    });
  }

  // Cleanup del modello
  static cleanupModel(model) {
    if (!model?.items) return;

    model.items.forEach(mesh => {
      if (mesh) {
        // Dispose della geometria
        if (mesh.geometry) {
          mesh.geometry.dispose();
        }

        // Dispose dei materiali
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(material => {
              if (material.map) material.map.dispose();
              material.dispose();
            });
          } else {
            if (mesh.material.map) mesh.material.map.dispose();
            mesh.material.dispose();
          }
        }
      }
    });

    // Clear della collection
    model.items.clear();
  }

  // Gestione delle proprietà del modello
  static async loadModelProperties(model, propertiesUrl) {
    try {
      const response = await fetch(propertiesUrl);
      if (!response.ok) throw new Error('Failed to load properties');
      
      const properties = await response.json();
      model.setLocalProperties(properties);
      
      return properties;
    } catch (error) {
      console.warn('Error loading model properties:', error);
      return null;
    }
  }

  // Statistiche del modello per debugging
  static getModelStats(model) {
    if (!model?.items) return null;

    let stats = {
      vertexCount: 0,
      triangleCount: 0,
      materialCount: new Set(),
      meshCount: model.items.size
    };

    model.items.forEach(mesh => {
      if (mesh?.geometry) {
        // Conta vertici
        if (mesh.geometry.attributes.position) {
          stats.vertexCount += mesh.geometry.attributes.position.count;
        }

        // Conta triangoli
        if (mesh.geometry.index) {
          stats.triangleCount += mesh.geometry.index.count / 3;
        } else {
          stats.triangleCount += mesh.geometry.attributes.position.count / 3;
        }

        // Conta materiali unici
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach(mat => stats.materialCount.add(mat.uuid));
          } else {
            stats.materialCount.add(mesh.material.uuid);
          }
        }
      }
    });

    stats.materialCount = stats.materialCount.size;
    return stats;
  }

  // Helper per il rendering condizionale del modello
  static setModelVisibility(model, visible) {
    if (!model?.items) return;

    model.items.forEach(mesh => {
      if (mesh) {
        mesh.visible = visible;
      }
    });
  }
}

export default ViewerUtils;