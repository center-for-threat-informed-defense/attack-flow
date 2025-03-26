import { LineFace } from "../Bases";
import { PositionSetByUser } from "../../ViewAttributes";
import { 
    getAbsoluteArrowHead,
    getAbsoluteMultiElbowPath,
    getLineHitbox, 
    round,
    roundNearestMultiple
} from "@OpenChart/Utilities";
import type { LineView } from "../../Views";
import type { GenericLineInternalState } from "./GenericLineInternalState";

/**
 * Applies a horizontal two-elbow layout to a line.
 * @param view
 *  The line's view.
 * @param face
 *  The line's face.
 */
export function runHorizontalTwoElbowLayout(
    view: LineView,
    face: GenericLineInternalState
) {
    const 
        src = view.source,
        hdl = view.handles[0],
        trg = view.target,
        sx = src.x,
        sy = src.y,
        tx = trg.x,
        ty = trg.y,
        mx = roundNearestMultiple((sx + tx) / 2, face.grid[0]),
        my = round((sy + ty) / 2);

    // Retain the reference handle, drop all others
    view.dropHandles(1);

    // Adjust handle
    hdl.userSetPosition &= PositionSetByUser.xAxis;
    if (!hdl.userSetPosition) {
        hdl.face.moveBy(mx - hdl.x, 0);
    }
    hdl.face.moveBy(0, my - hdl.y);
    const hx = hdl.x;

    // Update points
    if(face.points.length !== 3) {
        face.points = [src, hdl, trg];
    }
    
    // Apply cap space
    const [bx, ex] = oneAxisCapSpace(sx, tx, face.style.capSpace);

    // Calculate vertices
    let vertices;
    if(sy === ty) {
        vertices = [bx, sy, ex, ty];
    } else if(sx === hx) {
        vertices = [bx, sy, hx, ty, ex, ty];
    } else if(tx === hx) {
        vertices = [bx, sy, hx, sy, ex, ty];
    } else {
        vertices = [bx, sy, hx, sy, hx, ty, ex, ty];
    }

    // Run layout
    runMultiElbowLayout(face, vertices);

}

/**
 * Applies a vertical two-elbow layout to a line.
 * @param view
 *  The line's view.
 * @param face
 *  The line's face.
 */
export function runVerticalTwoElbowLayout(
    view: LineView,
    face: GenericLineInternalState
) {
    const
        src = view.source,
        hdl = view.handles[0],
        trg = view.target,
        sx = src.x,
        sy = src.y,
        tx = trg.x,
        ty = trg.y,
        mx = round((sx + tx) / 2),
        my = roundNearestMultiple((sy + ty) / 2, face.grid[1]);
    
    // Retain the reference handle, drop all others
    view.dropHandles(1);

    // Adjust handle
    hdl.userSetPosition &= PositionSetByUser.yAxis;
    if (!hdl.userSetPosition) {
        hdl.face.moveBy(0, my - hdl.y);
    }
    hdl.face.moveBy(mx - hdl.x, 0);
    const hy = hdl.y;
    
    // Update points
    if(face.points.length !== 3) {
        face.points = [src, hdl, trg];
    }

    // Apply cap space
    const [by, ey] = oneAxisCapSpace(sy, ty, face.style.capSpace);

    // Calculate vertices
    let vertices;
    if(sx === tx) {
        vertices = [sx, by, tx, ey];
    } else if(sy === hy) {
        vertices = [sx, by, tx, hy, tx, ey];
    } else if(ty === hy) {
        vertices = [sx, by, sx, hy, tx, ey];
    } else {
        vertices = [sx, by, sx, hy, tx, hy, tx, ey];
    }

    // Run layout
    runMultiElbowLayout(face, vertices);
}

/**
 * Applies a horizontal elbow layout to a line.
 * @param view
 *  The line's view.
 * @param face
 *  The line's face.
 */
export function runHorizontalElbowLayout(
    view: LineView,
    face: GenericLineInternalState
) {
    const
        src = view.source,
        hdl = view.handles[0],
        trg = view.target,
        sx = src.x,
        sy = src.y,
        tx = trg.x,
        ty = trg.y;

    // Retain the reference handle, drop all others
    view.dropHandles(1);
    
    // Adjust handle
    hdl.userSetPosition = PositionSetByUser.False;
    hdl.face.moveTo(tx, ty);

    // Update points
    if(face.points.length !== 2) {
        face.points = [src, trg];
    }

    // Calculate vertices
    let vertices;
    if(sx === tx) {
        // Apply cap space
        const [by, ey] = oneAxisCapSpace(sy, ty, face.style.capSpace);
        // Calculate vertices
        vertices = [sx, by, tx, ey];
    } else if (sy === ty) {
        // Apply cap space
        const [bx, ex] = oneAxisCapSpace(sx, tx, face.style.capSpace);
        // Calculate vertices
        vertices = [bx, sy, ex, ty];
    } else {
        // Apply cap space
        const [bx, ey] = twoAxisCapSpace(sx, tx, sy, ty, face.style.capSpace);
        // Calculate vertices
        vertices = [bx, sy, tx, sy, tx, ey]
    }

    // Run layout
    runMultiElbowLayout(face, vertices);

}

/**
 * Applies a vertical elbow layout to a line.
 * @param view
 *  The line's view.
 * @param face
 *  The line's face.
 */
export function runVerticalElbowLayout(
    view: LineView,
    face: GenericLineInternalState
) {
    const
        src = view.source,
        hdl = view.handles[0],
        trg = view.target,
        sx = src.x,
        sy = src.y,
        tx = trg.x,
        ty = trg.y;
    
    // Retain the reference handle, drop all others
    view.dropHandles(1);

    // Adjust handle
    hdl.userSetPosition = PositionSetByUser.False;
    hdl.face.moveTo(tx, ty);

    // Update points
    if(face.points.length !== 2) {
        face.points = [src, trg];
    }

    let vertices;
    if(sx === tx) {
        // Apply cap space
        const [by, ey] = oneAxisCapSpace(sy, ty, face.style.capSpace);
        // Calculate vertices
        vertices = [sx, by, tx, ey];
    } else if(sy === ty){
        // Apply cap space
        const [bx, ex] = oneAxisCapSpace(sx, tx, face.style.capSpace);
        // Calculate vertices
        vertices = [bx, sy, ex, ty];
    } else {
        // Apply cap space
        const [ex, by] = twoAxisCapSpace(tx, sx, ty, sy, face.style.capSpace);
        // Calculate vertices
        vertices = [sx, by, sx, ty, ex, ty]
    }

    // Run layout
    runMultiElbowLayout(face, vertices);
    
}

/**
 * Applies a multi-elbow layout to a line.
 * @remarks
 *  For best results, ensure that no two consecutive vertices are identical.
 *  Duplicate vertices are acceptable as long as they are not sequential.
 * @param face
 *  The line's face.
 * @param vertices
 *  The line's vertices. 
 */
function runMultiElbowLayout(face: GenericLineInternalState, vertices: number[]) {
    const v = vertices;
    const offset = LineFace.markerOffset;

    // Update hitboxes
    const hitboxes = (v.length >> 1) - 1;
    face.hitboxes
        = face.hitboxes.length === hitboxes
        ? face.hitboxes : new Array(hitboxes);
    const h = face.hitboxes;

    // Prepare transform
    const t = new Array(v.length);
    
    // Calculate start vertex
    let lx = 0, ly = 1, nx = 2, ny = 3;
    if(v[lx] === v[nx]) {
        t[lx] = v[lx] + offset;
        t[ly] = v[ly] < v[ny] ? v[ly] + (offset << 1) : v[ly];    
    } else {
        t[lx] = v[lx] < v[nx] ? v[lx] + (offset << 1) : v[lx];
        t[ly] = v[ly] + offset; 
    }

    // Calculate mid-vertices
    const length = v.length - 2;
    for(; nx < length; lx += 2, ly += 2, nx += 2, ny += 2) {
        // Calculate hitbox
        h[lx >> 1] = getLineHitbox(
            v[lx], v[ly],
            v[nx], v[ny],
            face.style.hitboxWidth
        );
        // Calculate mid-vertex
        t[nx] = v[nx] + offset;
        t[ny] = v[ny] + offset;
    }

    // Calculate hitbox
    h[lx >> 1] = getLineHitbox(
        v[lx], v[ly],
        v[nx], v[ny],
        face.style.hitboxWidth
    );

    // Calculate end vertex
    if(v[lx] === v[nx]) {
        t[nx] = v[nx] + offset;
        t[ny] = v[ly] < v[ny] ? v[ny] : v[ny] + (offset << 1); 
    } else {    
        t[nx] = v[lx] < v[nx] ? v[nx] : v[nx] + (offset << 1);
        t[ny] = v[ny] + offset;
    }

    // Calculate arrow head
    face.arrow = getAbsoluteArrowHead(
        t[lx], t[ly],
        t[nx], t[ny],
        face.style.capSize
    );

    // Calculate cap size offset
    if(v[lx] === v[nx]) {
        t[ny] -= Math.sign(t[ny] - t[ly]) * (face.style.capSize >> 1);
    } else {
        t[nx] -= Math.sign(t[nx] - t[lx]) * (face.style.capSize >> 1);
    }

    // Set vertices
    face.vertices = getAbsoluteMultiElbowPath(
        t, face.style.borderRadius
    );

}

/**
 * Applies cap space to a source and target coordinate on the same axis.
 * @param s
 *  The source coordinate.
 * @param t
 *  The target coordinate.
 * @param c
 *  The cap space.
 * @returns
 *  The adjusted source and target coordinates. 
 */
function oneAxisCapSpace(s: number, t: number, c: number) {
    const d = t - s;
    if(c << 1 < Math.abs(d)) {
        const cs = Math.sign(d) * c;
        return [s + cs, t - cs];
    } else {
        return [s, t];
    }
}

/**
 * Applies cap space to a source and target coordinate on two axises.
 * @param s1
 *  The source coordinate on axis 1.
 * @param t1
 *  The target coordinate on axis 1.
 * @param s2
 *  The source coordinate on axis 2.
 * @param t2
 *  The target coordinate on axis 2.
 * @param c
 *  The cap space.
 * @returns
 *  The adjusted source (axis 1) and target (axis 2) coordinates.
 */
function twoAxisCapSpace(s1: number, t1: number, s2: number, t2: number, c: number) {
    const d1 = t1 - s1;
    const d2 = t2 - s2;
    let s = s1, e = t2;
    if(c < Math.abs(d1)) {
        s += Math.sign(d1) * c;
    }
    if(c < Math.abs(d2)) {
        e -= Math.sign(d2) * c;
    }
    return [s, e];
}
