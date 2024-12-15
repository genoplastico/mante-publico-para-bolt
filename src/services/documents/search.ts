import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AuthService } from '../auth';
import type { Document, DocumentSearchQuery } from '../../types';

export class DocumentSearchService {
  static async searchDocuments(searchQuery: string): Promise<Document[]> {
    try {
      const user = AuthService.getCurrentUser();
      if (!user) throw new Error('Usuario no autenticado');

      let documentsQuery = collection(db, 'documents');
      
      if (user.role === 'secondary' && user.projectIds?.length) {
        documentsQuery = query(
          documentsQuery,
          where('projectId', 'in', user.projectIds)
        );
      }
      
      const querySnapshot = await getDocs(documentsQuery);
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Document));
      
      if (!searchQuery) return documents;
      
      const normalizedQuery = searchQuery.toLowerCase();
      return documents.filter(doc => {
        const searchableText = [
          doc.name,
          doc.metadata.description,
          ...doc.metadata.keywords,
          ...doc.metadata.tags,
          doc.metadata.category
        ].join(' ').toLowerCase();
        
        return searchableText.includes(normalizedQuery);
      });
    } catch (error) {
      throw new Error('Error al buscar documentos');
    }
  }

  static async searchWithFilters(query: DocumentSearchQuery): Promise<Document[]> {
    try {
      let q = query(collection(db, 'documents'));
      
      if (query.filters?.type?.length) {
        q = query(q, where('type', 'in', query.filters.type));
      }
      
      if (query.filters?.status?.length) {
        q = query(q, where('status', 'in', query.filters.status));
      }
      
      const querySnapshot = await getDocs(q);
      let documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Document));
      
      if (query.text) {
        const normalizedQuery = query.text.toLowerCase();
        documents = documents.filter(doc => {
          const searchableText = [
            doc.name,
            doc.metadata.description,
            ...doc.metadata.keywords,
            ...doc.metadata.tags,
            doc.metadata.category
          ].join(' ').toLowerCase();
          
          return searchableText.includes(normalizedQuery);
        });
      }
      
      if (query.filters?.dateRange) {
        const start = new Date(query.filters.dateRange.start);
        const end = new Date(query.filters.dateRange.end);
        documents = documents.filter(doc => {
          const docDate = new Date(doc.uploadedAt);
          return docDate >= start && docDate <= end;
        });
      }
      
      return documents;
    } catch (error) {
      throw new Error('Error al buscar documentos con filtros');
    }
  }
}