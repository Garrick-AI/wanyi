#!/usr/bin/env python3
"""Make a 1000x1500 Pinterest pin for a 萬一手冊 guide (Noto CJK system fonts, Pillow).
Output: assets/pins/<FILE>. Example:
  python3 tools/pin.py pin-will.png "香港點樣\\n立平安紙？" "有效遺囑的基本要求|見證人：找誰、避開誰|平安紙通常寫些甚麼|自己寫還是找律師|存放在哪裡" "萬一手冊｜立遺囑前要知的事"
"""
import os, sys
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','assets','pins')
HEART=[(0.0, 0.2155), (0.0003, 0.2107), (0.0026, 0.1966), (0.0087, 0.1745), (0.02, 0.1464), (0.0377, 0.1148), (0.0625, 0.0824), (0.0944, 0.0523), (0.1328, 0.0271), (0.1768, 0.0091), (0.2248, 0.0), (0.2748, 0.001), (0.3248, 0.0124), (0.3722, 0.0338), (0.4149, 0.0644), (0.4506, 0.1027), (0.4776, 0.1471), (0.4943, 0.1957), (0.5, 0.2468), (0.4943, 0.2988), (0.4776, 0.3507), (0.4506, 0.4014), (0.4149, 0.4506), (0.3722, 0.498), (0.3248, 0.5436), (0.2748, 0.5878), (0.2248, 0.6305), (0.1768, 0.672), (0.1328, 0.712), (0.0944, 0.7502), (0.0625, 0.7861), (0.0377, 0.8188), (0.02, 0.8474), (0.0087, 0.8709), (0.0026, 0.8885), (0.0003, 0.8993), (0.0, 0.903), (-0.0003, 0.8993), (-0.0026, 0.8885), (-0.0087, 0.8709), (-0.02, 0.8474), (-0.0377, 0.8188), (-0.0625, 0.7861), (-0.0944, 0.7502), (-0.1328, 0.712), (-0.1768, 0.672), (-0.2248, 0.6305), (-0.2748, 0.5878), (-0.3248, 0.5436), (-0.3722, 0.498), (-0.4149, 0.4506), (-0.4506, 0.4014), (-0.4776, 0.3507), (-0.4943, 0.2988), (-0.5, 0.2468), (-0.4943, 0.1957), (-0.4776, 0.1471), (-0.4506, 0.1027), (-0.4149, 0.0644), (-0.3722, 0.0338), (-0.3248, 0.0124), (-0.2748, 0.001), (-0.2248, 0.0), (-0.1768, 0.0091), (-0.1328, 0.0271), (-0.0944, 0.0523), (-0.0625, 0.0824), (-0.0377, 0.1148), (-0.02, 0.1464), (-0.0087, 0.1745), (-0.0026, 0.1966), (-0.0003, 0.2107), (0.0, 0.2155)]
from PIL import Image, ImageDraw, ImageFont
SERIF='/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc'; SANS='/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc'; MED='/usr/share/fonts/opentype/noto/NotoSansCJK-Medium.ttc'
CREAM='#FBF5EC'; PEACH='#F6E3D3'; PEACH2='#FAEEE3'; SAGE='#E4ECE3'; ACC='#C26A4A'; ACCD='#A0553A'; INK='#3E342C'; MUTED='#9A8C7E'; CARD='#FFFDF9'
def F(p,s): return ImageFont.truetype(p,s,index=4)
def house(d,cx,cy,s,w):
    c=ACC
    d.line([(cx-.5*s,cy-.05*s),(cx,cy-.47*s),(cx+.5*s,cy-.05*s)],fill=c,width=w,joint='curve')
    d.line([(cx-.37*s,cy-.13*s),(cx-.37*s,cy+.5*s),(cx+.37*s,cy+.5*s),(cx+.37*s,cy-.13*s)],fill=c,width=w,joint='curve')
    for pt in [(cx-.5*s,cy-.05*s),(cx+.5*s,cy-.05*s),(cx-.37*s,cy+.5*s),(cx+.37*s,cy+.5*s),(cx,cy-.47*s)]:
        d.ellipse((pt[0]-w/2,pt[1]-w/2,pt[0]+w/2,pt[1]+w/2),fill=c)
    hw=.40*s; top=cy+.03*s
    d.polygon([(cx+x*hw, top+y*hw) for x,y in HEART],fill=c)
def wrap(d,t,f,w):
    lines=[];cur=''
    for tok in (t.split(' ') if t.isascii() else list(t)):
        nxt=(cur+' '+tok).strip() if t.isascii() else cur+tok
        if d.textlength(nxt,font=f)>w and cur: lines.append(cur); cur=tok
        else: cur=nxt
    lines.append(cur); return lines
def pin(fn,kicker,title,items,foot,url,en=False):
    K=2; W,H=1000*K,1500*K
    im=Image.new('RGB',(W,H),CREAM); d=ImageDraw.Draw(im)
    d.ellipse((W*.55,-H*.08,W*1.25,H*.32),fill=PEACH); d.ellipse((W*.84,H*.05,W*.96,H*.13),fill=SAGE); d.ellipse((-W*.12,H*.86,W*.18,H*1.06),fill=SAGE)
    house(d,W*.82,H*.15,170*K,9*K)
    x=80*K; y=110*K
    d.text((x,y),kicker,font=F(MED,30*K),fill=ACC); y+=80*K
    ft=F(SERIF,(70 if en else 76)*K)
    for l in title.split('\n'):
        d.text((x,y),l,font=ft,fill=INK); y+=ft.size*1.32
    y+=30*K; d.rectangle((x,y,x+70*K,y+6*K),fill=ACC); y+=60*K
    fi=F(SANS,(36 if en else 40)*K); n=1
    cw=W-160*K
    for it in items:
        lines=wrap(d,it,fi,cw-130*K); h=max(96*K, len(lines)*fi.size*1.45+50*K)
        d.rounded_rectangle((x,y,x+cw,y+h),radius=28*K,fill=CARD,outline=PEACH,width=3*K)
        d.ellipse((x+30*K,y+h/2-28*K,x+86*K,y+h/2+28*K),fill=PEACH)
        d.text((x+58*K,y+h/2),str(n),font=F(MED,30*K),fill=ACCD,anchor='mm')
        ty=y+h/2-len(lines)*fi.size*1.45/2
        for l in lines: d.text((x+110*K,ty),l,font=fi,fill=INK); ty+=fi.size*1.45
        y+=h+22*K; n+=1
    fy=H-190*K
    d.text((x,fy),foot,font=F(MED,34*K),fill=ACCD)
    d.text((x,fy+62*K),url,font=F(SANS,28*K),fill=MUTED)
    im.resize((1000,1500),Image.LANCZOS).save(os.path.join(OUT,fn))

U='garrick-ai.github.io/wanyi'
if __name__=='__main__':
    # usage: python3 tools/pin.py pin-<slug>.png "標題第一行\n第二行" "要點1|要點2|要點3|要點4|要點5" "萬一手冊｜副題"
    # Chinese guide pins only; title line breaks must be explicit (\n), 4-6 chars per line works best.
    if len(sys.argv)<5: sys.exit(__doc__ or 'usage: pin.py FILE TITLE ITEMS FOOT [KICKER]')
    fn,title,items,foot=sys.argv[1:5]
    kicker=sys.argv[5] if len(sys.argv)>5 else '香港・實用指南'
    pin(fn,kicker,title.replace('\\n','\n'),items.split('|'),foot,U+'/guides/')
    print(os.path.join(OUT,fn))
