import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppGuessSongService } from '../guess-song.service';
import { songsList } from '../guess-song-list/song';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-guess-song-header',
  templateUrl: './guess-song-header.component.html',
  styleUrls: ['guess-song-header.component.scss'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class AppGuessSongHeaderComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  public showSpecialSong = false;
  public showKeys = false;
  public keys: number[];
  public songNumber: number; // 歌曲数
  public playingTimes: number; // 歌曲播放的总次数

  // 获得3把钥匙
  public guessRightHandler(): void {
    this.showKeys = true;
    this.keys = [1, 2, 3];
    localStorage.setItem('keys', JSON.stringify(this.keys));
  }

  public github(): void {
    const url = 'https://github.com/QingFlow/sound';
    if (this.electronService.isElectronApp) {
      this.electronService.shell.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  }

  constructor(
    private electronService: ElectronService,
    private appGuessSongService: AppGuessSongService
  ) { }

  ngOnInit(): void {
    this.songNumber = songsList.length;
    this.playingTimes = Number.parseInt(JSON.parse(localStorage.getItem('playingTimes')), 10) || 0;
    const keys = JSON.parse(localStorage.getItem('keys'));
    if (keys) {
      this.keys = keys;
      this.showKeys = true;
    }
    this.appGuessSongService.keyExpend$.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
      this.keys.length = this.keys.length - 1;
      localStorage.setItem('keys', JSON.stringify(this.keys));
    });
    this.appGuessSongService.playNewSong$.pipe(takeUntil(this.unsubscribe$)).subscribe(v => {
      if (!v) {
        this.playingTimes++;
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
