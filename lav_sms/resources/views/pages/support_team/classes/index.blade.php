@extends('layouts.master')
@section('page_title', 'Manage Classes')
@section('content')

    <div class="card">
        <div class="card-header header-elements-inline d-flex align-items-center justify-content-between">
            <h6 class="card-title"><i class="icon-windows2 mr-2"></i> Manage Classes</h6>
            
            @if(Qs::userIsTeamSA())
                <!-- Create Class Button -->
                <button type="button" class="btn btn-primary btn-sm d-flex align-items-center" data-toggle="modal" data-target="#createClassModal" style="border-radius: 8px;">
                    <i class="icon-plus-circle2 mr-2"></i> Create Class
                </button>
            @endif
        </div>

        <div class="card-body">
            <!-- Table showing all classes (Takes full page width) -->
            <table class="table datatable-button-html5-columns">
                <thead>
                <tr>
                    <th>S/N</th>
                    <th>Name</th>
                    <th>Class Type</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                @foreach($my_classes as $c)
                    <tr>
                        <td>{{ $loop->iteration }}</td>
                        <td>{{ $c->name }}</td>
                        <td>{{ $c->class_type->name }}</td>
                        <td class="text-center">
                            <div class="list-icons">
                                <div class="dropdown">
                                    <a href="#" class="list-icons-item" data-toggle="dropdown">
                                        <i class="icon-menu9"></i>
                                    </a>

                                    <div class="dropdown-menu dropdown-menu-left">
                                        @if(Qs::userIsTeamSA())
                                            {{--Edit--}}
                                            <a href="{{ route('classes.edit', $c->id) }}" class="dropdown-item"><i class="icon-pencil"></i> Edit</a>
                                        @endif
                                        @if(Qs::userIsSuperAdmin())
                                            {{--Delete--}}
                                            <a id="{{ $c->id }}" onclick="confirmDelete(this.id)" href="#" class="dropdown-item"><i class="icon-trash"></i> Delete</a>
                                            <form method="post" id="item-delete-{{ $c->id }}" action="{{ route('classes.destroy', $c->id) }}" class="hidden">@csrf @method('delete')</form>
                                        @endif
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                @endforeach
                </tbody>
            </table>
        </div>
    </div>

    @if(Qs::userIsTeamSA())
        <!-- CREATE CLASS MODAL -->
        <div id="createClassModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="createClassModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered" role="document">
                <div class="modal-content" style="border-radius: 16px; overflow: hidden; border: none; box-shadow: 0 10px 30px rgba(0,0,0,0.15);">
                    <div class="modal-header bg-primary text-white" style="padding: 1.2rem 1.5rem;">
                        <h5 class="modal-title" id="createClassModalLabel" style="font-weight: 700; color: #ffffff !important;"><i class="icon-windows2 mr-2"></i> Create Class</h5>
                        <button type="button" class="close text-white" data-dismiss="modal" aria-label="Close" style="opacity: 0.8; font-size: 1.5rem;">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <form class="ajax-store" method="post" action="{{ route('classes.store') }}">
                        @csrf
                        <div class="modal-body" style="padding: 1.5rem;">
                            
                            <div class="alert alert-info border-0 alert-dismissible mb-3" style="border-radius: 8px;">
                                <button type="button" class="close" data-dismiss="alert"><span>&times;</span></button>
                                <span>When a class is created, a Section will be automatically created for the class. You can edit it or add more sections at <a target="_blank" href="{{ route('sections.index') }}" class="font-weight-bold">Manage Sections</a>.</span>
                            </div>

                            <div class="form-group">
                                <label class="font-weight-semibold">Name <span class="text-danger">*</span></label>
                                <input name="name" value="{{ old('name') }}" required type="text" class="form-control" placeholder="Name of Class">
                            </div>

                            <div class="form-group">
                                <label for="modal_class_type_id" class="font-weight-semibold">Class Type <span class="text-danger">*</span></label>
                                <select required data-placeholder="Select Class Type" class="form-control select" name="class_type_id" id="modal_class_type_id">
                                    @foreach($class_types as $ct)
                                        <option {{ old('class_type_id') == $ct->id ? 'selected' : '' }} value="{{ $ct->id }}">{{ $ct->name }}</option>
                                    @endforeach
                                </select>
                            </div>

                        </div>
                        <div class="modal-footer" style="background-color: #f8fafc; border-top: 1px solid rgba(0,0,0,0.05); padding: 1rem 1.5rem;">
                            <button type="button" class="btn btn-light" data-dismiss="modal" style="border-radius: 8px;">Cancel</button>
                            <button id="ajax-btn" type="submit" class="btn btn-primary">Submit <i class="icon-paperplane ml-2"></i></button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    @endif

@endsection
