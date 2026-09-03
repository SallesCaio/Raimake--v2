import { NgModule } from '@angular/core';
import { FirestoreDatePipe } from './firestore-date.pipe';

@NgModule({
  declarations: [FirestoreDatePipe],
  exports: [FirestoreDatePipe],
})
export class PipesModule {}