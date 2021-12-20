import { useHistory, useParams } from 'react-router-dom';
import { AxiosRequestConfig } from 'axios';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { requestBackend } from 'util/requests';
import './styles.css';
import { Department } from 'types/department';
import { Employee } from 'types/employee';

type UrlParams = {
  employeeId: string;
};

const Form = () => {

  const { employeeId } = useParams<UrlParams>();

  const isEditing = employeeId !== 'create';

  const history = useHistory();

  const [selectCategories, setSelectCategories] = useState<Department[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm<Employee>();

  useEffect(() => {
    requestBackend({ 
      url: `/departments`,
      withCredentials: true  }).then((response) => {
      setSelectCategories(response.data);
    });
  }, []);

  useEffect(() => {
    if (isEditing) {
      requestBackend({ url: `/employees/${employeeId}` }).then((response) => {
        const employee = response.data as Employee;

        setValue('name', employee.name);
        setValue('email', employee.email);
        setValue('department', employee.department);
      });
    }
  }, [isEditing, employeeId, setValue]);

  const onSubmit = (formData: Employee) => {
    const data = {
      ...formData
    };

    const config: AxiosRequestConfig = {
      method: isEditing ? 'PUT' : 'POST',
      url: isEditing ? `/employees/${employeeId}` : '/employees',
      data,
      withCredentials: true,
    };

    requestBackend(config).then(() => {
      toast.info('Cadastrado com sucesso');
      history.push('/admin/employees');
    })
    .catch(() => {
      toast.error('Erro ao cadastrar funcionário');
    });
  };


  const handleCancel = () => {
    history.push('/admin/employees');
  };

  return (
    <div className="employee-crud-container">
      <div className="base-card employee-crud-form-card">
        <h1 className="employee-crud-form-title">INFORME OS DADOS</h1>

        <form onSubmit={handleSubmit(onSubmit)} data-testid="form">
          <div className="row employee-crud-inputs-container">
            <div className="col employee-crud-inputs-left-container">

              <div className="margin-bottom-30">
              <input
                  {...register('name', {
                    required: 'Campo obrigatório',
                  })}
                  type="text"
                  className={`form-control base-input ${
                    errors.name ? 'is-invalid' : ''
                  }`}
                  placeholder="Nome do funcionário"
                  name="name"
                  data-testid="name"
                />
                <div className="invalid-feedback d-block">
                  {errors.name?.message}
                </div>
              </div>

              <div className="margin-bottom-30">
              <input
                  {...register('email', {
                    required: 'Campo obrigatório',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Email inválido',
                    },
                  })}
                  type="text"
                  className={`form-control base-input ${
                    errors.name ? 'is-invalid' : ''
                  }`}
                  placeholder="Email do funcionário"
                  name="email"
                  data-testid="email"
                />
                <div className="invalid-feedback d-block">
                  {errors.email?.message}
                </div>
                <div className="invalid-feedback d-block">
                  
                </div>
              </div>

              <div className="margin-bottom-30">
                <label htmlFor='department' className="d-none">Departamentos</label>
                <Controller
                  name="department"
                  rules={{ required: true }}
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={selectCategories}
                      classNamePrefix="product-crud-select"
                      isMulti
                      getOptionLabel={(department: Department) => department.name}
                      getOptionValue={(department: Department) =>
                        String(department.id)
                      }
                      inputId="departments"
                    />
                  )}
                />
                {errors.department && (
                  <div className="invalid-feedback d-block">
                    Campo Obrigatório
                  </div>
                )}
              </div>

            </div>
          </div>
          <div className="employee-crud-buttons-container">
            <button
              className="btn btn-outline-danger employee-crud-button"
              onClick={handleCancel}
            >
              CANCELAR
            </button>
            <button className="btn btn-primary employee-crud-button text-white">
              SALVAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Form;
